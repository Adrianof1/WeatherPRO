<#
  Registra a configuração do PC usado na build local e (opcional) os dados do AAB/APK gerado.
  Acrescenta uma entrada em docs/REGISTRO-BUILDS.md. NÃO registra senhas.

  Uso (na raiz do projeto, PowerShell):
    .\scripts\registrar-ambiente-build.ps1                     # antes da build: só o ambiente
    .\scripts\registrar-ambiente-build.ps1 -Artefato android\app\build\outputs\bundle\release\app-release.aab -Observacao "v3.1 teste interno"

  Se o Windows bloquear: powershell -ExecutionPolicy Bypass -File .\scripts\registrar-ambiente-build.ps1
#>
param(
  [string]$Artefato = "",
  [string]$Observacao = "",
  [string]$Saida = "docs/REGISTRO-BUILDS.md"
)
$ErrorActionPreference = "Continue"
$linhas = New-Object System.Collections.Generic.List[string]
function Add([string]$k, $v) { if (-not $v) { $v = "(não encontrado)" }; $linhas.Add("| $k | $(($v.ToString().Trim()) -replace '\r?\n', ' ') |") }
# Roda um comando e devolve a saída (stdout + stderr, porque "java -version" escreve no stderr).
# Se o comando falhar (código de saída <> 0), devolve $null e a tabela mostra "(não encontrado)".
function Rodar([scriptblock]$b) {
  $ErrorActionPreference = "Continue"  # "SilentlyContinue" descartaria o stderr no PowerShell 5.1
  try {
    $global:LASTEXITCODE = 0
    $saida = (& $b 2>&1 | ForEach-Object { "$_" } | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { return $null }
    $saida
  } catch { $null }
}
function Primeira($t) { if ($t) { ($t -split "`r?`n")[0] } }

# -- Sistema --
$os = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
$cpu = Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue | Select-Object -First 1
$disco = Get-PSDrive -Name (Get-Location).Drive.Name -ErrorAction SilentlyContinue
Add "Windows" "$($os.Caption) $($os.Version) (build $($os.BuildNumber))"
Add "CPU" "$($cpu.Name) - $($cpu.NumberOfLogicalProcessors) threads"
Add "RAM" ("{0:N1} GB" -f ($os.TotalVisibleMemorySize / 1MB))
Add "Disco livre ($((Get-Location).Drive.Name):)" ("{0:N1} GB" -f ($disco.Free / 1GB))

# -- Android Studio --
$asDirs = @("$env:ProgramFiles\Android\Android Studio", "$env:LOCALAPPDATA\Programs\Android Studio", "C:\dev\android-studio")
$as = $asDirs | Where-Object { Test-Path "$_\product-info.json" } | Select-Object -First 1
if ($as) {
  $info = Get-Content "$as\product-info.json" -Raw | ConvertFrom-Json
  Add "Android Studio" "$($info.name) $($info.version) (build $($info.buildNumber)) - $as"
} else { Add "Android Studio" "não instalado (build pelo SDK de linha de comando + Gradle)" }

# -- Java --
Add "JAVA_HOME" $env:JAVA_HOME
# Usa o Java do JAVA_HOME (o mesmo do Gradle); o java do PATH pode ser outro ou nem existir.
$javaBin = if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) { "$env:JAVA_HOME\bin" } else { $null }
$java = if ($javaBin) { "$javaBin\java.exe" } else { "java" }
$keytool = if ($javaBin) { "$javaBin\keytool.exe" } else { "keytool" }
Add "java -version" (Primeira (Rodar { & $java -version }))
Add "java no PATH" $(if (Get-Command java -ErrorAction SilentlyContinue) { (Get-Command java).Source } else { "não (Gradle usa o JAVA_HOME)" })

# -- Android SDK --
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else { "$env:LOCALAPPDATA\Android\Sdk" }
Add "ANDROID_HOME" $sdk
foreach ($pasta in "platforms", "build-tools", "ndk", "cmake") {
  $itens = if (Test-Path "$sdk\$pasta") { (Get-ChildItem "$sdk\$pasta" -Directory | ForEach-Object Name) -join ", " }
  Add "SDK $pasta" $itens
}
if (Test-Path "$sdk\platform-tools\adb.exe") { Add "adb" (Primeira (Rodar { & "$sdk\platform-tools\adb.exe" version })) }

# -- Node / Expo / projeto --
Add "Node" (Rodar { node -v })
Add "npm" (Rodar { npm -v })
Add "Expo SDK (pacote)" (Rodar { node -p "require('expo/package.json').version" })
Add "React Native" (Rodar { node -p "require('react-native/package.json').version" })
$app = Get-Content app.json -Raw | ConvertFrom-Json
Add "App" "$($app.expo.name) $($app.expo.version) - versionCode $($app.expo.android.versionCode) - $($app.expo.android.package)"
Add "Git" "$(Rodar { git rev-parse --abbrev-ref HEAD }) @ $(Rodar { git rev-parse --short HEAD })$(if (Rodar { git status --porcelain }) { ' (com alterações não commitadas!)' })"

# -- Gradle --
if (Test-Path "android\gradle\wrapper\gradle-wrapper.properties") {
  Add "Gradle wrapper" ((Select-String -Path "android\gradle\wrapper\gradle-wrapper.properties" -Pattern "distributionUrl").Line -replace ".*distributions/", "")
}
if (Test-Path "android\gradle.properties") {
  Add "org.gradle.jvmargs" ((Select-String -Path "android\gradle.properties" -Pattern "^org.gradle.jvmargs").Line -replace "^org.gradle.jvmargs=", "")
  Add "reactNativeArchitectures" ((Select-String -Path "android\gradle.properties" -Pattern "^reactNativeArchitectures").Line -replace "^reactNativeArchitectures=", "")
}
$gp = "$env:USERPROFILE\.gradle\gradle.properties"
$temChave = (Test-Path $gp) -and (Select-String -Path $gp -Pattern "^WEATHERPRO_UPLOAD_STORE_FILE" -Quiet)
Add "Chave de upload configurada" $(if ($temChave) { "sim (~/.gradle/gradle.properties)" } else { "NÃO - release sai com chave de debug" })

# -- Artefato --
if ($Artefato -and (Test-Path $Artefato)) {
  $arq = Get-Item $Artefato
  Add "Artefato" "$($arq.FullName) ($("{0:N1}" -f ($arq.Length / 1MB)) MB, $($arq.LastWriteTime.ToString('yyyy-MM-dd HH:mm')))"
  Add "SHA-256 do arquivo" (Get-FileHash $Artefato -Algorithm SHA256).Hash
  $cert = Rodar { & $keytool -printcert -jarfile $Artefato }
  $dono = ($cert -split "`r?`n" | Where-Object { $_ -match "^(Owner|Proprietário):" } | Select-Object -First 1)
  $sha = ($cert -split "`r?`n" | Where-Object { $_ -match "SHA256:" } | Select-Object -First 1)
  Add "Assinado por" $dono
  Add "Certificado SHA-256" ($sha -replace ".*SHA256:\s*", "")
  if ($dono -match "Android Debug") { Write-Warning "Artefato assinado com a chave de DEBUG: a Play Store vai recusar." }
}

$cab = "## $(Get-Date -Format 'yyyy-MM-dd HH:mm') - $env:COMPUTERNAME$(if ($Observacao) { " - $Observacao" })"
$bloco = @("", $cab, "", "| Item | Valor |", "|---|---|") + $linhas
if (-not (Test-Path $Saida)) { "# Registro de builds locais`n`nGerado por scripts/registrar-ambiente-build.ps1 (ou .sh). Não contém senhas." | Set-Content $Saida -Encoding utf8 }
$bloco | Add-Content $Saida -Encoding utf8
Write-Host "Registrado em $Saida"

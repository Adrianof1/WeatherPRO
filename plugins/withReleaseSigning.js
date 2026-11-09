// Plugin do Expo: assina a build de release com a chave de upload (Play Store).
//
// A pasta android/ é recriada a cada `expo prebuild`, então qualquer ajuste manual no build.gradle se perde.
// Este plugin reescreve a assinatura de release em todo prebuild, lendo as credenciais de propriedades do Gradle
// que ficam FORA do repositório, em ~/.gradle/gradle.properties (Windows: C:\Users\<você>\.gradle\gradle.properties):
//
//   WEATHERPRO_UPLOAD_STORE_FILE=C:/dev/keys/weatherpro-upload.jks
//   WEATHERPRO_UPLOAD_STORE_PASSWORD=...
//   WEATHERPRO_UPLOAD_KEY_ALIAS=upload
//   WEATHERPRO_UPLOAD_KEY_PASSWORD=...
//
// Sem essas propriedades, a release continua com a chave de debug (serve para testar no celular,
// mas a Play Store recusa) e o Gradle mostra um aviso.
const { withAppBuildGradle } = require('expo/config-plugins');

const PREFIX = 'WEATHERPRO_UPLOAD';
const MARKER = '// [withReleaseSigning]';

const signingBlock = `
        release {
            ${MARKER}
            if (project.hasProperty('${PREFIX}_STORE_FILE')) {
                storeFile file(project.property('${PREFIX}_STORE_FILE'))
                storePassword project.property('${PREFIX}_STORE_PASSWORD')
                keyAlias project.property('${PREFIX}_KEY_ALIAS')
                keyPassword project.property('${PREFIX}_KEY_PASSWORD')
            }
        }`;

const releaseSigningLine = `signingConfig project.hasProperty('${PREFIX}_STORE_FILE') ? signingConfigs.release : signingConfigs.debug
            if (!project.hasProperty('${PREFIX}_STORE_FILE')) {
                logger.warn('[WeatherPRO] ${PREFIX}_STORE_FILE não definido: release assinada com a chave de DEBUG (não serve para a Play Store).')
            }`;

function applySigning(gradle) {
  if (gradle.includes(MARKER)) return gradle;

  // 1) adiciona signingConfigs.release logo depois do bloco debug
  const debugSigning = /(signingConfigs\s*\{\s*debug\s*\{[^}]*\})/;
  if (!debugSigning.test(gradle)) throw new Error('[withReleaseSigning] bloco signingConfigs.debug não encontrado');
  gradle = gradle.replace(debugSigning, `$1${signingBlock}`);

  // 2) troca a assinatura do buildType release
  const releaseType = /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/;
  if (!releaseType.test(gradle)) throw new Error('[withReleaseSigning] buildTypes.release não encontrado');
  return gradle.replace(releaseType, `$1${releaseSigningLine}`);
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') throw new Error('[withReleaseSigning] build.gradle em Kotlin não suportado');
    cfg.modResults.contents = applySigning(cfg.modResults.contents);
    return cfg;
  });
};

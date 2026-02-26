import { PrismaClient, TipoPregunta } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEncuestaTamizaje() {
  console.log('🌱 Iniciando seed de Encuesta de Tamizaje...')

  // Limpiar preguntas existentes (opcional)
  // await prisma.preguntaTamizaje.deleteMany({})

  const preguntas = [
    // ========== SÍNTOMAS ACTUALES ==========
    { texto: '¿Presión o dolor de pecho al hacer ejercicio?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 1, soloMujer: false, requiereDetalle: false },
    { texto: '¿Los tobillos hinchados?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 2, soloMujer: false, requiereDetalle: false },
    { texto: '¿Falta de aliento o dificultad para respirar al hacer ejercicio leve?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 3, soloMujer: false, requiereDetalle: false },
    { texto: '¿Se queda sin aliento cuando se tumba o necesita más almohadas cuando duerme?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 4, soloMujer: false, requiereDetalle: false },
    { texto: '¿Reciente pérdida de peso, fiebre, sudor en la noche?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 5, soloMujer: false, requiereDetalle: true },
    { texto: '¿Tos persistente?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 6, soloMujer: false, requiereDetalle: false },
    { texto: '¿Tos con sangre?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 7, soloMujer: false, requiereDetalle: false },
    { texto: '¿Problemas de coagulación o hemorragias?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 8, soloMujer: false, requiereDetalle: true },
    { texto: '¿Presenta hematomas, moretones o cardenales con facilidad?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 9, soloMujer: false, requiereDetalle: false },
    { texto: '¿Mareo?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 10, soloMujer: false, requiereDetalle: false },
    { texto: '¿Dolor de cabeza?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 11, soloMujer: false, requiereDetalle: false },
    { texto: '¿Desmayo o pérdida de la consciencia?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 12, soloMujer: false, requiereDetalle: true },
    { texto: '¿Convulsiones?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 13, soloMujer: false, requiereDetalle: true },
    { texto: '¿Visión borrosa?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 14, soloMujer: false, requiereDetalle: false },
    { texto: '¿Dificultad para ver bien?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 15, soloMujer: false, requiereDetalle: false },
    { texto: '¿Problemas nasales?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 16, soloMujer: false, requiereDetalle: true },
    { texto: '¿Ruidos o zumbidos en los oídos?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 17, soloMujer: false, requiereDetalle: false },
    { texto: '¿Dificultad para tragar?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 18, soloMujer: false, requiereDetalle: false },
    { texto: '¿Diarrea?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 19, soloMujer: false, requiereDetalle: false },
    { texto: '¿Estreñimiento?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 20, soloMujer: false, requiereDetalle: false },
    { texto: '¿Sangre en las heces?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 21, soloMujer: false, requiereDetalle: false },
    { texto: '¿Vómitos?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 22, soloMujer: false, requiereDetalle: false },
    { texto: '¿Náuseas?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 23, soloMujer: false, requiereDetalle: false },
    { texto: '¿Ictericia?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 24, soloMujer: false, requiereDetalle: false },
    { texto: '¿Sed excesiva?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 25, soloMujer: false, requiereDetalle: false },
    { texto: '¿Orina más de 6 veces al día?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 26, soloMujer: false, requiereDetalle: false },
    { texto: '¿Boca seca?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 27, soloMujer: false, requiereDetalle: false },
    { texto: '¿Dificultad al orinar?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 28, soloMujer: false, requiereDetalle: false },
    { texto: '¿Sangre en la orina?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 29, soloMujer: false, requiereDetalle: false },
    { texto: '¿Dolor o rigidez en huesos y/o articulaciones?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 30, soloMujer: false, requiereDetalle: false },
    { texto: '¿Dificultad para moverse?', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 31, soloMujer: false, requiereDetalle: false },
    { texto: 'Sinusitis', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 32, soloMujer: false, requiereDetalle: false },
    { texto: 'Bronquitis', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 33, soloMujer: false, requiereDetalle: false },
    { texto: 'Pleuritis', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 34, soloMujer: false, requiereDetalle: false },
    { texto: 'Dificultad para respirar', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 35, soloMujer: false, requiereDetalle: false },
    { texto: 'Sordera', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 36, soloMujer: false, requiereDetalle: false },
    { texto: 'Vértigo', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 37, soloMujer: false, requiereDetalle: false },
    { texto: 'Parálisis', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 38, soloMujer: false, requiereDetalle: true },
    { texto: 'Nerviosismo', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 39, soloMujer: false, requiereDetalle: false },
    { texto: 'Angustia', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 40, soloMujer: false, requiereDetalle: false },
    { texto: 'Depresión', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 41, soloMujer: false, requiereDetalle: false },
    { texto: 'Insomnio', tipo: TipoPregunta.SI_NO, categoria: 'SÍNTOMAS ACTUALES', orden: 42, soloMujer: false, requiereDetalle: false },

    // ========== ENFERMEDADES CARDIOVASCULARES ==========
    { texto: 'Cardiovascular: infarto, angina, soplos, insuficiencia cardíaca, trastornos del ritmo cardíaco', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: 'Apoplejía/ictus/accidente cerebrovascular', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 2, soloMujer: false, requiereDetalle: true },
    { texto: 'Insuficiencia coronaria, oclusión coronaria, ateroesclerosis', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 3, soloMujer: false, requiereDetalle: true },
    { texto: 'Hipertensión', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 4, soloMujer: false, requiereDetalle: false },
    { texto: 'Presión baja', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 5, soloMujer: false, requiereDetalle: false },
    { texto: 'Trombosis, Embolia', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 6, soloMujer: false, requiereDetalle: true },
    { texto: '¿Marcapasos?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 7, soloMujer: false, requiereDetalle: false },
    { texto: '¿Cardiopatías congénitas?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 8, soloMujer: false, requiereDetalle: true },
    { texto: '¿Fiebre reumática o enfermedad cardíaca reumática?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 9, soloMujer: false, requiereDetalle: false },
    { texto: '¿Válvula artificial del corazón?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 10, soloMujer: false, requiereDetalle: false },
    { texto: '¿Articulación artificial?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES CARDIOVASCULARES', orden: 11, soloMujer: false, requiereDetalle: true },

    // ========== ENFERMEDADES DIGESTIVAS ==========
    { texto: '¿Problemas del estómago, úlceras? Úlcera de estómago, Gastritis, Colitis', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES DIGESTIVAS', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: '¿Hepatitis, ictericia, cirrosis u otras enfermedades hepáticas?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES DIGESTIVAS', orden: 2, soloMujer: false, requiereDetalle: true },
    { texto: 'Enfermedades de la vesícula biliar', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES DIGESTIVAS', orden: 3, soloMujer: false, requiereDetalle: true },

    // ========== ENFERMEDADES INFECTOCONTAGIOSAS ==========
    { texto: 'Enfermedades venéreas: sífilis, gonorrea, VIH/SIDA', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES INFECTOCONTAGIOSAS', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: '¿Herpes?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES INFECTOCONTAGIOSAS', orden: 2, soloMujer: false, requiereDetalle: false },

    // ========== ENFERMEDADES LOCOMOTORAS ==========
    { texto: 'Problemas óseo-articulares: Reumatismo, Artritis, Artrosis, Gota', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES LOCOMOTORAS', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: '¿Enfermedades de los ojos, Glaucoma?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES LOCOMOTORAS', orden: 2, soloMujer: false, requiereDetalle: true },

    // ========== ENFERMEDADES HEMATOLÓGICAS ==========
    { texto: 'Anemia, leucemia', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES HEMATOLÓGICAS', orden: 1, soloMujer: false, requiereDetalle: true },

    // ========== ENFERMEDADES NEFROLÓGICAS Y UROGENITALES ==========
    { texto: '¿Enfermedades renales (riñón), vejiga?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES NEFROLÓGICAS', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: 'Cálculos, Diálisis', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES NEFROLÓGICAS', orden: 2, soloMujer: false, requiereDetalle: true },
    { texto: 'Problemas de la próstata', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES NEFROLÓGICAS', orden: 3, soloMujer: false, requiereDetalle: true },

    // ========== ENFERMEDADES ENDOCRINOLÓGICAS ==========
    { texto: '¿Enfermedades de tiroides o glándulas suprarrenales? Trastornos de tiroides, Bocio', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES ENDOCRINOLÓGICAS', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: '¿Diabetes?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES ENDOCRINOLÓGICAS', orden: 2, soloMujer: false, requiereDetalle: false },

    // ========== ENFERMEDADES NEUROLÓGICAS ==========
    { texto: 'Epilepsia', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES NEUROLÓGICAS', orden: 1, soloMujer: false, requiereDetalle: true },

    // ========== ENFERMEDADES RESPIRATORIAS ==========
    { texto: '¿Asma, tuberculosis, enfisema, otras enfermedades pulmonares?', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES RESPIRATORIAS', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: 'Fiebre del heno', tipo: TipoPregunta.SI_NO, categoria: 'ENFERMEDADES RESPIRATORIAS', orden: 2, soloMujer: false, requiereDetalle: false },

    // ========== TUMORES Y CÁNCER ==========
    { texto: '¿Tumores, cáncer u otra patología de cabeza o cuello?', tipo: TipoPregunta.SI_NO, categoria: 'TUMORES Y CÁNCER', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: '¿Ha requerido cirugía, radioterapia, quimioterapia, trasplante de médula?', tipo: TipoPregunta.SI_NO, categoria: 'TUMORES Y CÁNCER', orden: 2, soloMujer: false, requiereDetalle: true },

    // ========== ALERGIAS ==========
    { texto: '¿Reacciones cutáneas, urticaria, exantema cutáneo?', tipo: TipoPregunta.SI_NO, categoria: 'ALERGIAS', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: 'Alergia al látex', tipo: TipoPregunta.SI_NO, categoria: 'ALERGIAS', orden: 2, soloMujer: false, requiereDetalle: false },
    { texto: 'Alergia a alimentos', tipo: TipoPregunta.SI_NO, categoria: 'ALERGIAS', orden: 3, soloMujer: false, requiereDetalle: true },
    { texto: 'Alergia a yodo o contrastes radiográficos', tipo: TipoPregunta.SI_NO, categoria: 'ALERGIAS', orden: 4, soloMujer: false, requiereDetalle: false },
    { texto: 'Alergia a anestésicos locales', tipo: TipoPregunta.SI_NO, categoria: 'ALERGIAS', orden: 5, soloMujer: false, requiereDetalle: true },
    { texto: 'Alergia a penicilina u otros antibióticos', tipo: TipoPregunta.SI_NO, categoria: 'ALERGIAS', orden: 6, soloMujer: false, requiereDetalle: true },
    { texto: 'Alergia a sulfamidas', tipo: TipoPregunta.SI_NO, categoria: 'ALERGIAS', orden: 7, soloMujer: false, requiereDetalle: false },
    { texto: 'Alergia a aspirina o AINES', tipo: TipoPregunta.SI_NO, categoria: 'ALERGIAS', orden: 8, soloMujer: false, requiereDetalle: true },
    { texto: 'Alergia a codeína u otros narcóticos', tipo: TipoPregunta.SI_NO, categoria: 'ALERGIAS', orden: 9, soloMujer: false, requiereDetalle: true },
    { texto: 'Alergia a barbitúricos, sedantes o fármacos contra el insomnio', tipo: TipoPregunta.SI_NO, categoria: 'ALERGIAS', orden: 10, soloMujer: false, requiereDetalle: true },

    // ========== OTRAS CONDICIONES ==========
    { texto: '¿Lentes de contacto?', tipo: TipoPregunta.SI_NO, categoria: 'OTRAS CONDICIONES', orden: 1, soloMujer: false, requiereDetalle: false },
    { texto: '¿Lleva aparato dental?', tipo: TipoPregunta.SI_NO, categoria: 'OTRAS CONDICIONES', orden: 2, soloMujer: false, requiereDetalle: false },
    { texto: '¿Alguna otra enfermedad que no haya sido enumerada?', tipo: TipoPregunta.SI_NO, categoria: 'OTRAS CONDICIONES', orden: 3, soloMujer: false, requiereDetalle: true },

    // ========== HISTORIAL HOSPITALARIO ==========
    { texto: '¿Ha estado hospitalizado en los últimos 5 años?', tipo: TipoPregunta.SI_NO, categoria: 'HISTORIAL HOSPITALARIO', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: '¿Ha precisado alguna vez cirugía?', tipo: TipoPregunta.SI_NO, categoria: 'HISTORIAL HOSPITALARIO', orden: 2, soloMujer: false, requiereDetalle: true },
    { texto: '¿Ha precisado alguna vez transfusión sanguínea?', tipo: TipoPregunta.SI_NO, categoria: 'HISTORIAL HOSPITALARIO', orden: 3, soloMujer: false, requiereDetalle: true },
    { texto: '¿Ha tenido una enfermedad grave en los últimos 5 años?', tipo: TipoPregunta.SI_NO, categoria: 'HISTORIAL HOSPITALARIO', orden: 4, soloMujer: false, requiereDetalle: true },

    // ========== ESTADO DE SALUD ACTUAL ==========
    { texto: '¿Está actualmente en buen estado de salud general?', tipo: TipoPregunta.SI_NO, categoria: 'ESTADO DE SALUD ACTUAL', orden: 1, soloMujer: false, requiereDetalle: false },
    { texto: '¿Está actualmente bajo tratamiento médico?', tipo: TipoPregunta.SI_NO, categoria: 'ESTADO DE SALUD ACTUAL', orden: 2, soloMujer: false, requiereDetalle: true },
    { texto: 'Medicación anterior', tipo: TipoPregunta.TEXTAREA, categoria: 'ESTADO DE SALUD ACTUAL', orden: 3, soloMujer: false, requiereDetalle: false },
    { texto: 'Medicación actual', tipo: TipoPregunta.TEXTAREA, categoria: 'ESTADO DE SALUD ACTUAL', orden: 4, soloMujer: false, requiereDetalle: false },

    // ========== MEDICAMENTOS ACTUALES ==========
    { texto: '¿Está administrándose Aspirina?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 1, soloMujer: false, requiereDetalle: false },
    { texto: '¿Está administrándose fármacos para la osteoporosis?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 2, soloMujer: false, requiereDetalle: true },
    { texto: '¿Está administrándose fármacos para problemas cardíacos, digitálicos?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 3, soloMujer: false, requiereDetalle: true },
    { texto: '¿Está administrándose fármacos para la diabetes, Insulina, tolbutamida?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 4, soloMujer: false, requiereDetalle: true },
    { texto: '¿Está administrándose anticoagulantes?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 5, soloMujer: false, requiereDetalle: false },
    { texto: '¿Está administrándose antihistamínicos?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 6, soloMujer: false, requiereDetalle: false },
    { texto: '¿Está administrándose antihipertensivos?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 7, soloMujer: false, requiereDetalle: true },
    { texto: '¿Está administrándose cortisona o corticoides?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 8, soloMujer: false, requiereDetalle: true },
    { texto: '¿Está administrándose antibióticos o sulfamidas?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 9, soloMujer: false, requiereDetalle: true },
    { texto: '¿Está administrándose tranquilizantes?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 10, soloMujer: false, requiereDetalle: false },
    { texto: '¿Está administrándose anticonvulsivante, Fenitoína?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 11, soloMujer: false, requiereDetalle: true },
    { texto: '¿Está administrándose nitroglicerina?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 12, soloMujer: false, requiereDetalle: false },
    { texto: '¿Algún otro medicamento que no haya sido nombrado?', tipo: TipoPregunta.SI_NO, categoria: 'MEDICAMENTOS ACTUALES', orden: 13, soloMujer: false, requiereDetalle: true },

    // ========== TRATAMIENTO PSIQUIÁTRICO ==========
    { texto: '¿Ha sido atendido por un psicólogo/psiquiatra en últimos 2 años?', tipo: TipoPregunta.SI_NO, categoria: 'TRATAMIENTO PSIQUIÁTRICO', orden: 1, soloMujer: false, requiereDetalle: true },

    // ========== HÁBITOS ==========
    { texto: '¿Drogas de uso recreativo?', tipo: TipoPregunta.SI_NO, categoria: 'HÁBITOS', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: '¿Tabaco de cualquier tipo? Fuma habitualmente', tipo: TipoPregunta.SI_NO, categoria: 'HÁBITOS', orden: 2, soloMujer: false, requiereDetalle: true },
    { texto: '¿Alcohol (bebidas alcohólicas)?', tipo: TipoPregunta.SI_NO, categoria: 'HÁBITOS', orden: 3, soloMujer: false, requiereDetalle: true },

    // ========== ANTECEDENTES GINECOLÓGICOS (Solo Mujeres) ==========
    { texto: '¿Está o podría estar embarazada?', tipo: TipoPregunta.SI_NO, categoria: 'ANTECEDENTES GINECOLÓGICOS', orden: 1, soloMujer: true, requiereDetalle: false },
    { texto: '¿Está actualmente lactando?', tipo: TipoPregunta.SI_NO, categoria: 'ANTECEDENTES GINECOLÓGICOS', orden: 2, soloMujer: true, requiereDetalle: false },
    { texto: '¿Está tomando pastillas anticonceptivas orales u otra terapia hormonal?', tipo: TipoPregunta.SI_NO, categoria: 'ANTECEDENTES GINECOLÓGICOS', orden: 3, soloMujer: true, requiereDetalle: true },

    // ========== INFORMACIÓN ADICIONAL ==========
    { texto: '¿Tiene o ha tenido alguna otra enfermedad, condición o problema médico que NO haya sido enumerado?', tipo: TipoPregunta.SI_NO, categoria: 'INFORMACIÓN ADICIONAL', orden: 1, soloMujer: false, requiereDetalle: true },

    // ========== ANTECEDENTES DENTALES ==========
    { texto: '¿Ha sufrido o padece alguna lesión en la boca o en la mandíbula (úlcera o inflamación)?', tipo: TipoPregunta.SI_NO, categoria: 'ANTECEDENTES DENTALES', orden: 1, soloMujer: false, requiereDetalle: true },
    { texto: '¿Ha tenido alguna reacción o complicación con la anestesia?', tipo: TipoPregunta.SI_NO, categoria: 'ANTECEDENTES DENTALES', orden: 2, soloMujer: false, requiereDetalle: true },
    { texto: '¿Ha sufrido hemorragias anormales con extracciones dentales, cirugías o accidentes?', tipo: TipoPregunta.SI_NO, categoria: 'ANTECEDENTES DENTALES', orden: 3, soloMujer: false, requiereDetalle: true },
    { texto: '¿Padece alguna discapacidad que le impida ser tratado en consulta dental?', tipo: TipoPregunta.SI_NO, categoria: 'ANTECEDENTES DENTALES', orden: 4, soloMujer: false, requiereDetalle: true },
    { texto: '¿Algún problema grave asociado con algún tratamiento dental previo?', tipo: TipoPregunta.SI_NO, categoria: 'ANTECEDENTES DENTALES', orden: 5, soloMujer: false, requiereDetalle: true },
    { texto: '¿Tiene algún dolor ahora?', tipo: TipoPregunta.SI_NO, categoria: 'ANTECEDENTES DENTALES', orden: 6, soloMujer: false, requiereDetalle: true }
  ]

  for (const pregunta of preguntas) {
    const existe = await prisma.preguntaTamizaje.findFirst({
      where: { texto: pregunta.texto }
    })

    if (!existe) {
      await prisma.preguntaTamizaje.create({
        data: pregunta
      })
      console.log(`✅ Pregunta creada: ${pregunta.texto}`)
    } else {
      console.log(`⏭️  Pregunta ya existe: ${pregunta.texto}`)
    }
  }

  console.log(`\n✨ Seed de preguntas de tamizaje completado`)
  console.log(`📊 Total de preguntas: ${preguntas.length}`)
  console.log(`📋 Categorías: 19 secciones organizadas`)
  console.log(`   - SÍNTOMAS ACTUALES: 42 preguntas`)
  console.log(`   - ENFERMEDADES CARDIOVASCULARES: 11 preguntas`)
  console.log(`   - ENFERMEDADES DIGESTIVAS: 3 preguntas`)
  console.log(`   - ALERGIAS: 10 preguntas`)
  console.log(`   - MEDICAMENTOS ACTUALES: 13 preguntas`)
  console.log(`   - ANTECEDENTES DENTALES: 6 preguntas`)
  console.log(`   - Y más...`)
}

seedEncuestaTamizaje()
  .catch((error) => {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

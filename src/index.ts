import express, { response } from "express";
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as env from './environment/environment';
import * as db from './db-connection';

const app = express();
app.use(cors());
app.use(express.json());


import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();
let idchar = 0;
let user = "";
const character = [
    {
        id: 0,
        name: "",
        hp: 0,
        strength: 0,
        agility: 0,
        luck: 0,
        alive: true,
        run: true,
        state: {
            name: "",
            description: ""
        },
        xp: 0
    }
];

const genAI = new GoogleGenerativeAI(process.env.api_key || env.environment.api_key)
const promtNarrativa = `Créame el comienzo de una historia de fantasía estilo dungeons and dragons para un juego, 
nárrame la historia como si ya estuviese en el juego, al final de esta historia necesito que me des tres opciones 
distintas de acciones que pueda realizar el jugador, estas acciones deben de tener coherencia con la historia que
me estas contando y tienen que tener distintos desenlaces, estos desenlaces pueden aumentar las estadísticas del 
jugador de distintas formas, aplicarle efectos de estado negativos como congelación o envenenamiento, aplicarle 
elementos de estados positivos como curación o fuerza, aplicarle mejoras de estadísticas permanentes como la vida 
o el daño o de incluso causar la muerte del personaje, piensa que cada una de las acciones que pueda realizar el 
personaje luego, la escogida, será la acción que realizara a continuación y tiene que tener un desarrollo coherente,
no me muestres lo que va a ocurrir a continuación con cada acción debe de ser sorpresa, no muestres como pueden variar
las estadísticas del jugador con cada decisión deben de ser sorpresa, las decisiones deben de ser la primera la A, la
segunda la B y la tercera la C, recuerda que debe de ser una historia principal que muestra al jugador en una situación
donde deba de tomar una decisión, elabora bastante esta primera situación para que el jugador se sumerja en la 
historia, si el jugador muere no le dejes escoger mas opciones, envía un mensaje al final del texto en mayúsculas
que diga DEAD, si el jugador completa el objetivo principal de la historia enviaras al final del mensaje un texto
que pondrá VICTORIA y no mostraras las 3 opciones y daremos la partida como finalizada, el jugador comienza con 
sus respectivos puntos de vida, las acciones pueden subírselos, bajárselos o dejarlos estables, el jugador muere 
cuando estos puntos debida caen a 0 o por debajo, ten en cuenta que la perdida de vida debe de ser coherente a la acción 
realizada por o al personaje (ejemplo: ataque de dragón = -100 de puntos de vida / ataque de goblin = -10 de puntos de vida), 
también los rivales que vaya encontrando el jugador por el camino deben de tener unos puntos de vida propios, 
coherentes con su personaje y estado (ejemplo: dragón 500 puntos de vida / goblin 10 puntos de vida), también tiene que 
haber una posibilidad de encontrar jefes por el camino, estos jefes solo podrán aparecer después de las primeras 
3 decisiones del jugador (no antes), se deberá de avisar al jugador de que esta contra un jefe, estos jefes deberán 
de ir aumentando de estadísticas a medida que se vayan aumentando las decisiones del jugador 
(ejemplo: decisión numero cuatro jefe sencillo / decisión numero 20 jefe mas complicado), las decisiones también 
tienen que se coherentes en cuanto a riesgo, una decisión que contiene un riesgo mayor debe de dar una recompensa mayor 
y si sale mal un castigo del la misma magnitud de la cual seria la recompensa, este nivel de dificultad debes de 
mostrarlo con un contador de dificultad desde el 1 hasta el 10, siendo el 10 la dificultad máxima y el 1 la dificultad mínima
, que aparezca en cada elección de manera aleatoria (recordar que el nivel de dificultad debe de ser coherente con la 
narrativa de la acción), este nivel de dificultad debe de ser mas probable que aparezca en un nivel alto a medida que 
aumentan las elecciones, ahora voy a mostrarte las estadísticas del personaje, tiene 100 puntos de estadística en cada 
aspecto, 100 es la base, el punto intermedio, las acciones que le ocurran al personaje pueden modificar permanentemente 
estas estadísticas o modificarlas temporalmente, las estadísticas son, vida, fuerza: la cantidad de daño que realiza el 
personaje, agilidad: la habilidad para acertar golpes, esquivar ataques, asestar críticos y moverse con mas libertad y 
velocidad y la surte: cuanta mayor suerte mejores elecciones consigues, mejor suerte tienes en cada elección 
(mas posibilidades de que salga beneficiosa) o que consigas mejores recompensas o mejoras de estadísticas en cada elección, las estadísticas se te 
enviaran en forma de array, después de cada elección, antes de elegir A, B o C se te enviara una array con todas las 
estadísticas del personaje, tienes que modificarla con las variaciones que hayan surgido durante el turno y volvérmela 
a enviar sin ningún tipo de texto, solo la array modificada para que después yo pueda procesarla con mi código, esta 
array ira a la par con este mensaje (al final del mensaje) para empezar la partida y que puedas adaptar los sucesos 
del turno a las estadísticas del personaje, la array contendrán los valores anteriores de vida, fuerza, agilidad y suerte,
el nombre e id del personaje, la descripción (breve descripción del personaje), el estado del personaje (alive) si 
el valor es true es que esta vivo y si el valor es false es que esta muerto (si muere has de cambiar el valor a false),
el estado de la partida (run) si es true es que la partida sigue en curso y si el jugador completa el objetivo 
principal de la historia cambia a false dando a entender que la partida a acabado de manera victoriosa para el personaje,
dentro de esta array también habrá un objeto que será estados, que son los estados positivos o negativos que le 
agregas al personaje, tendrá dos variables, el nombre del estado y la descripción (una breve descripción de lo que hace)
además si el jugador completa el objetivo principal de la partida todos sus estados se borrar pero las mejoras permanentes
a sus estadísticas no, también su vida sube a su máximo posible (ejemplo: si esta a 50/100 la vida al acabar sube a 100/100),
si el estado en algún momento es eliminado tendrás que borrarlo de la array, recuerda que los valores base son 100 en todas
las estadísticas por lo cual ten en cuenta de manera coherente lo que afecta un escalado balanceado la mejora de estas 
habilidades a la narrativa del juego, que una mejora muy pequeña no afecte mucho pero que una mayor mejora si que afecte mas,
tendrás que usar el valor de nombre de la array como nombre para el personaje en la narrativa, también te tendrás que basar 
en la descripción del personaje para aplicarla a la narrativa pero que esta descripción no afecte a las capacidades ni estadísticas
del personaje sino que simplemente te ayude a sumergirte mas en la narrativa de la partida. Depemdiemdo de las acciones realizadas
y la dificultad de las mismas le debes de dar una catidad de experiencia al jugador, teniendo en cuenta que el maximo que puedes
ganar por partida es 100 puntos de experiencia, entonces añade muy poca experiencia por accion para que el completar la
mision principal da un pequeño extra de experiencia al total de experienci adquirido. Piensa que el texto se va a mostrar en un juego
asi que el formato debe de ser adecuado para ello, no uses saltos de linea innecesarios ni caracteres raros, usa un lenguaje
adecuado para un juego de fantasia y dungeons and dragons, tiene que ser bonito de ver asi que no utilices carcteres
extraños ni simbolos raros, intenta mostrar lo menos posibles las estadisticas del jugador en la narrativa, solo cuando sea necesario
porque hayan sufrido algun cambio. El texto no lo alagrgues mucho unas 100 palabras y las elecciones A B y C separadas del
texto principal, y que se vean bien separadas entre ellas y tampoco muy largas, acuerdate de al final de estas poner el nivel de
dificultad de cada opcion y que cada una sea completamente distinta a la otra. Y no muestres nunca en el texto la array que te he
pasado. Muy importante recuerda que la narrativa que envies es un texto que se va a mostrar en el juego asi que no
enseñes la array en el texto mejor pon los cambios de estadisticas por ejemplo si la vida estaba a 100 y recibe un daño
de 20 ponle Vida: 80/100, si gana fuerza pon Fuerza: 110/100 etc... todo de esta forma clara y sencilla para que el jugador lo entienda bien
y sea visualmente bonito. Cuando te envie solo una letra A B o C tu me tienes que responder con la continuación de la historia
sigue aplicando la norma de no mostrar la array en el texto y mostrar los cambios de estadísticas de forma visual y clara para el jugador
al igual que la regla de no mostrar simbolos extraños como * o similares. Recuerda que si el jugador muere tienes que poner al final DEAD y si completa el objetivo principal VICTORIA
y cambiar la estadistica de run si muere o gana la partida o la de alive si muere. SI el jugador muere en el proximo mensaje no 
muestres las opciones A/B/C simplemente muestra el mensaje de que ha muerto y al final DEAD. Al final no me pongas el JSON con 
las estadisticas del personaje nunca enseñes el JSON raw en el texto. A la hora de devolver la respuesta cuando el jugador
elige A/B/C el texto sigue teniendo que ser de maximo 100 palabras sin contr las opciones y tiene que ocupar solo una accion,
por ejemplo, si estas peleando cada golpe que da el jugador tiene q ser una decision no hagas una pelea en el que el jugador
ataca varias veces antes de tener que hacer una eleccion A/B/C y asi con todo, cada decision o accion que realice el personaje 
tiene que ser decidida por el jugador, a todo esto recuerda que simpre tienen que ser distintas entre ellas las opciones
A/B/C y que cada una tenga un nivel de dificultad distinto, no repitas niveles de dificultad en las opciones. Tambien tienes que
ir dandole objetos a los jugadores despues de completar algunas acciones, objetos con habilidades las cuales puedan ustilizar
por lo tanto en las opciones A/B/C tendras que tener en cuenta que puedan usar esos objetos en las decisiones que tomen,
tambien pueden subir su vida maxima por encima de 100 con ciertos objetos o acciones, asi que cuando ganen pon la vida del jugador
al maximo que la haya tenido a lo largo de la partida, por ejemplo si un jugador ha llegado a tener 150 de vida y acaba la partida
con una victoria y su vida es de 80 pues se la subes a 150, asi con lo maximo que haya sido para cada jugador y siempre tiene que estar
la vida en positivo nunca puede estar en negativo NUNCA. Las partidas deben
de durar como minimo 8 elecciones de A/B/C a medida de que avanza la partida las recompensas son mayores al igual que los riesgos
por lo que las mejoras de las estadisticas aumentan tambien, es decir si en la ronda 4 ganarias +5 de agiladad en la ronda 12 podrias 
ganar +10 de agilidad por ejemplo recuerda no mostrar todas las estadisticas cada vez solo las que cambian. Ahora no no hay maximo de vida
ni de agilidad ni de suerte ni de fuerza, asi que no pongas maximos a las estadisticas del personaje. Solo marcame cual era la vida principal del personaje
y como varia. Manten la misma trama todo e tiempo y no tiene porque acabar la mision a la que muere el primer jefe, sino que puedes
en las opciones A/B/C poner una opcion despues de derrotar al jefe de continuar o finalizar la mision principal, para que el jugador 
tambien pueda decidir si quiere seguir con la aventura o no. Recuerda que la narrativa tiene que ser coherente con las estadísticas del personaje
y sus estados, si el personaje tiene un estado de congelación no puedes narrar que corre rápido por ejemplo, adapta la narrativa
a las estadísticas y estados del personaje. Y tambien el objetivo principal uede ser otro q no sea matar a un jefe. Cada vez que salga
un enemigo marcame cuanta vida tiene con el siguiente formato: NOMBRE ENEMIGO: VIDA ENEMIGO. Los items te los enviare al final del 
mensaje despues de la array del personaje, es posible que el personaje no tenga items iniciales. Con esta array despues yo te pedire 
que, basandote en ella, me crees items y que los elimines dependiendo del transcurso de la narrativa. Ahora tambien siempre que se cumpla
una accion buena que realize el personaje puede recibir monedas de oro, cuando consiga las monedas lo mostraras asi: MONEDAS: +3 (por ejemplo),
y cuando consiga un objeto lo mostraras asi: ITEM CONSEGUIDO: NOMBRE DEL ITEM: DESCRIPCION DEL ITEM (PRECIO DEL ITEM). Tienes que ponerle a los items
un precio basado en lo buenos que son y las acciones que realizan. El jugador solo puede obtener un item por accion. Si en la narrativa
se gasta un item del jugador que ya tuviera o que haya conseguido en la aventura ese item se borra, y lo tienes que mostrar asi: 
ITEM ELIMINADO : NOMBRE DEL ITEM, luego te preguntare cada turno si has eliminado algun item si es asi respondes como se te indicara con un 
JSON con el nombre y el id del character. Algunos items pueden ser utilizados varias veces sin gastarse, por ejemplo una espada 
puede utilizarse varias veces sin eliminarse hasta que se rompa o se te pierda por ejemplo, pero una pocion, que solo t l a puedes beber, 
tiene un solo uso, y despues de su primer uso debe eliminarse, esto significa que habrá items que no tendras que borrar siempre 
que se utilicen, asi q esos items no los elimines al primer uso ano ser que la narrativa diga lo contrario por algun factor poco comun 
como podria ser que te lo roben, que se rompa, o que lo pierdas. Las monedas que consigas ves acumulandolas a un total, guarda siempre 
el total de monedas. Piensa que tienes que dar menor cantidad de monedas que de experiencia, para darte un ejemplo mas o menos has de 
dar 1 moneda por cada 5 de experiencia, esto es porque las monedas son muy valiosas y sirven para comprar objetos asi que vete con cuidado 
a la hora de dar monedas para no pasarte, igual que la experiencia las monedas aumentan en cantidad dependiendo de la ronda en la que estes
y la dificultad de cada accion. El escalado de las monedas y la xp debe de ser lento para mantener un buen balance en el juego y recompensar 
las acciones realizadas solo en rondas uy altas. Siempre que el jugador complete la mision principal debe de ser recompensado con 
un objeto especial o una mejora de estadisticas permanentes igual que cuando derrote a un jefe. El valor normal d ela suerte es 100, esta misma
afecta a la calidad de los onjetos que consigues, cuanto mayor la suerte por encima de 100 encuentras mejores objetos que de normal igual que tienes mas 
suerte en combate e interacciones. Muy importante apartir de ahora va a llegar una letra la cual definira la accion que hacer basandose 
en las opciones d A/B/C de la accion anterior, asi que actua en forma de narrativa SIEMPRE a la hora de responder y todo en español de españa
muy importante mantener en todo momento la narrativa en cada una de tus respuestas, no enseñes nunca el pensamiento
detras de la generacion de cada respuesta solo la narrativa. Recuerda que las monedas y la xp deben de estar balanceadas ñadae muy poca 
cantidad de ellas en acciones normales 5 de xp y 1 moneda, y apartir d ahi incrementando muy poco a poco, basandote en las acciones
que realiza el jugador y recompensando por su riesgo y tardanza.
Responde siempre en español y solo con la narrativa y lo que se indica en el prompt, estas en un juego solo texto que se tenga que ver
en el juego.
El array del personaje es este {{CHARACTER_ARRAY}}
El array de los items que tiene el personaje {{ITEMS_ARRAY}}` // Prompt inicial

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Escogemos el modelo del LLM que queremos usar
let gameResponse = {
    id: 0,
    description: '',
    hp: 0,
    strength: 0,
    agility: 0,
    luck: 0,
    alive: true,
    run: true,
    coins: 0,
    xp: 0,
    response: ''
}
let userpromt = '' // Variable para almacenar la respuesta del usuario
let chat = model.startChat({ //Creamos el chat donde se guardan las conversaciones para que el LLM tenga contexto y responda coherentemente
    history: [], // Empieza vacia
})

// Función para actualizar el XP del usuario sumando el XP de todos sus personajes
async function updateUserXP(userId: string | number) {
    try {
        const sumXpResult = await db.query(
            `SELECT SUM(xp) as total_xp FROM character WHERE user_id = $1`,
            [userId]
        );
        const totalXp = sumXpResult.rows[0].total_xp || 0;
        await db.query(
            `UPDATE "user" SET xp = $1 WHERE id = $2`,
            [totalXp, userId]
        );
        console.log(`XP de usuario ${userId} actualizado a ${totalXp}`);
        return totalXp;
    } catch (err) {
        console.error('Error actualizando XP de usuario:', err);
        throw err;
    }
}

app.get('/gemini/:charId', async (req, res) => {
    try {
        const { charId } = req.params;

        idchar = Number(charId);
        if (!charId) {
            return res.status(400).json({ error: 'charId es requerido' });
        }

        // 1. Cargar personaje específico
        const result = await db.query(
            `SELECT id, name, hp, strength, agility, luck, alive, run, state, xp, user_id
       FROM "character" WHERE id = $1`,
            [charId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }

        const char = result.rows[0];
        character[0].state = char.state;

        const characterArray = [{
            id: char.id,
            name: char.name,
            hp: char.hp,
            strength: char.strength,
            agility: char.agility,
            luck: char.luck,
            alive: char.alive,
            run: true,
            state: char.state || { name: "", description: "" },
            xp: char.xp || 0
        }];

        user = char.user_id

        const objects = await db.query(
            `SELECT * FROM item
         WHERE character_id = $1 AND on_market = false`,
            [charId]
        );

        console.log('Items del personaje cargados:', objects.rows);

        // Reiniciar el chat para asegurar que cada partida empieza con historial limpio
        chat = model.startChat({ history: [] });
        console.log('Nuevo chat iniciado para el personaje');

        // 3. Preparar prompt con el personaje concreto y los items
        const promptFinal = promtNarrativa.replace(
            '{{CHARACTER_ARRAY}}',
            JSON.stringify(characterArray),
        ).replace('{{ITEMS_ARRAY}}', JSON.stringify(objects.rows));

        // 4. Generar narrativa inicial
        const geminiResult = await chat.sendMessage(promptFinal);
        const narrative = (await geminiResult.response).text();

        // 5. Respuesta única y completa para el frontend
        res.json({
            character: characterArray[0],     // personaje fresco (con id real)
            narrative: narrative              // texto inicial de la historia
        });

        console.log(`Partida iniciada para personaje ${charId}`);
        console.log('Narrativa inicial enviada al cliente:', narrative);


    } catch (err) {
        console.error('Error iniciando partida con Gemini:', err);
        res.status(500).json({ error: 'Error al iniciar la aventura' });
    }
});

// app.post('/gemini', async (req, res) => {
//     console.log('Petición recibida al endpoint POST /gemini');


//     try {
//         const character = req.body.character; // Recibimos el personaje del frontend

//         if (!character) return res.status(400).json({ error: 'No character provided' });

//         // Construimos el array inicial con los datos del personaje
//         const characterArray = [
//             {
//                 id: character.id || 1,
//                 name: character.name,
//                 hp: character.hp,
//                 strength: character.strength,
//                 agility: character.agility,
//                 luck: character.luck,
//                 alive: character.alive,
//                 run: true,
//                 state: character.state || { name: '', description: '' },
//                 xp: character.xp || 0
//             }
//         ];

//         // Creamos el prompt final sustituyendo solo el array
//         const promptFinal = promtNarrativa.replace(
//             '{{CHARACTER_ARRAY}}',
//             JSON.stringify(character)
//         );

//         const result = await chat.sendMessage(promptFinal);
//         const response = await result.response;

//         res.json({ text: response.text() });

//         console.log('Respuesta enviada al cliente:', response.text());

//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error on the initial prompt');
//     }
// });


//AÑADIR EL CAMBIO DE LAS ESTADISTICAS DEL CHARACTER
app.get('/geminiresponse/:option', async (req, res) => { // Llamada principal para responder a las opciones del usuario
    console.log(`Petición recibida al endpoint GET /geminiresponse/:option`);

    try {
        userpromt = ''  // Vaciamos la variable para que no se acumule la respuesta anterior
        userpromt = req.params.option

        const statsPrompt = `
Devuélveme OBLIGATORIAMENTE un JSON VÁLIDO, sin ningún texto adicional antes o después,
con las estadísticas ACTUALES del jugador tras la última acción realizada.

El formato debe ser EXACTAMENTE este:

{
  "hp": number,
  "strength": number,
  "agility": number,
  "luck": number,
  "alive": boolean,
  "run": boolean,
  "xp": number,
  "monedas": number
}

NO INCLUYAS NINGÚN TIPO DE TEXTO ADICIONAL DE JSON O DE COMILLAS
NO añadas explicaciones.
NO envíes texto fuera del JSON.
NO encierres el JSON en comillas ni en bloques de código
NO añadas nada mas que lo mostrado en el formato porfavor necesito poder trabajar con el JSON.
NO des nunca ningun valor en negativo para ninguna estadistica y asegurate de que el hp se puede leer bien.
QUERO QUE TU RESPUESTA SEA UNICAMENTE RELLENAR EL JSON DEFINIDO ANTERIORMENTE CON LOS VALORES ACTUALES DE LAS ESTADÍSTICAS.

`;

        const itemsPrompt = `
        Devuélveme OBLIGATORIAMENTE un JSON VÁLIDO, sin ningún texto adicional antes o después,
        con el item conseguido tras la última acción realizada.
        El formato debe ser EXACTAMENTE este:
        {
            "name": string,
            "description": string,
            "price": number
        }
        NO INCLUYAS NINGÚN TIPO DE TEXTO ADICIONAL DE JSON O DE COMILLAS
        NO envíes texto fuera del JSON.
        NO encierres el JSON en comillas ni en bloques de código
        NO añadas nada mas que lo mostrado en el formato porfavor necesito poder trabajar con el JSON.
        QUERO QUE TU RESPUESTA SEA UNICAMENTE RELLENAR EL JSON DEFINIDO ANTERIORMENTE CON LOS VALORES DEL ITEM CONSEGUIDO.
        SI NO HA CONSEGUIDO NINGUN ITEM RESPONDE CON "NO"
        `;

        const itemsDestroyPrompt = `
        Devuélveme OBLIGATORIAMENTE un JSON VÁLIDO, sin ningún texto adicional antes o después,
        con el item conseguido eliminado tras la última acción realizada. Si no se ha eliminado ningun item da una respuesta de NO
        El formato debe ser EXACTAMENTE este:
        {
            "name": string
        }
        NO INCLUYAS NINGÚN TIPO DE TEXTO ADICIONAL DE JSON O DE COMILLAS
        NO envíes texto fuera del JSON.
        NO encierres el JSON en comillas ni en bloques de código
        NO añadas nada mas que lo mostrado en el formato porfavor necesito poder trabajar con el JSON.
        QUERO QUE TU RESPUESTA SEA UNICAMENTE RELLENAR EL JSON DEFINIDO ANTERIORMENTE
        SI NO SE HA ELIMINADO NINGUN ITEM RESPONDE CON "NO" 
        `;

        console.log('Respuesta efectuada cargando promt...')
        // Enviar la opción con contexto claro para que la IA entienda que es una elección del juego
        const contextualPrompt = `El jugador ha elegido la opción ${userpromt}. Continúa la narrativa del juego basándote en esta elección.`;
        const result = await chat.sendMessage(contextualPrompt);
        const response = await result.response;


        const statsResult = await chat.sendMessage(statsPrompt);
        const cleanStatsResult = extractBetweenBraces(statsResult.response.text());

        const itemsResult = await chat.sendMessage(itemsPrompt);
        const cleanItemsResult = extractBetweenBraces(itemsResult.response.text());

        const itemsDestroyResult = await chat.sendMessage(itemsDestroyPrompt)
        const cleanItemsDestroyResult = extractBetweenBraces(itemsDestroyResult.response.text())


        let stats;
        try {
            stats = cleanStatsResult ? JSON.parse(cleanStatsResult) : null;
        } catch (e) {
            console.error('JSON inválido:', cleanStatsResult);
            return res.status(500).json({ error: 'Invalid stats JSON from Gemini' });
        }
        console.log('Estadísticas extraídas del JSON:', stats);
        if (stats.hp === undefined || stats.hp === null) {
            console.log('Estadística de vida (hp) no encontrada en el JSON, reintentando...');
            // En el reintento también usar contexto claro
            const contextualPrompt = `El jugador ha elegido la opción ${userpromt}. Continúa la narrativa del juego basándote en esta elección.`;
            const result = await chat.sendMessage(contextualPrompt);
            const response = await result.response;

            const statsResult = await chat.sendMessage(statsPrompt);
            const cleanStatsResult = extractBetweenBraces(statsResult.response.text());

            let stats;
            try {
                stats = cleanStatsResult ? JSON.parse(cleanStatsResult) : null;
            } catch (e) {
                console.error('JSON inválido:', cleanStatsResult);
                return res.status(500).json({ error: 'Invalid stats JSON from Gemini' });
            }
            console.log('Estadísticas extraídas del JSON en el reintento:', stats);
        }

        //Item manipulatiooooooon
        let itemGame
        let itemBd

        console.log('Clean Item Result:', cleanItemsResult)

        if (cleanItemsResult === "NO" || cleanItemsResult === "no" || cleanItemsResult === "No" || cleanItemsResult === null) {
            console.log('No hay item en este turno')
        } else {
            console.log('Si que hay Item')
            try {
                itemGame = cleanItemsResult ? JSON.parse(cleanItemsResult) : null;
                console.log('ItemGame:', itemGame)
            } catch (e) {
                console.error('JSON inválido:', cleanItemsResult);
                return res.status(500).json({ error: 'Invalid items JSON from Gemini' });
            }

            itemBd = {
                name: String(itemGame.name),
                description: String(itemGame.description),
                rareza: 'Unico',
                price: itemGame.price,
                character_id: idchar
            }

            const insertItem = await db.query(
                `INSERT INTO item
            (name, description, rareza, price,character_id, on_market)
            VALUES
            ($1, $2, $3, $4, $5, false)`,
                [itemBd.name, itemBd.description, itemBd.rareza, itemBd.price, itemBd.character_id]
            )

            console.log('Item añadido en la base de datos:', insertItem);
        }
        let itemRemove
        if (cleanItemsDestroyResult === "NO" || cleanItemsDestroyResult === "no" || cleanItemsDestroyResult === "No" || cleanItemsDestroyResult === null) {
            console.log('No hay items para borrar', cleanItemsDestroyResult)
        } else {
            console.log("Si hay items para borrar", cleanItemsDestroyResult)
            try {
                itemRemove = cleanItemsDestroyResult ? JSON.parse(cleanItemsDestroyResult) : null;
                console.log('ItemRemove:', itemRemove)
            } catch (e) {
                console.error('JSON inválido:', cleanItemsDestroyResult);
                return res.status(500).json({ error: 'Invalid items JSON from Gemini' });
            }

            const deletItem = await db.query(
                `DELETE FROM item
                WHERE name = $1 AND character_id = $2
                `,
                [itemRemove.name, idchar]
            )
        }
        //Fin de la item manipulasionnn

        if (stats.hp < 0) {
            stats.hp = 0;
        }   // Aseguramos que la vida no sea negativa

        gameResponse = {
            id: idchar,
            description: '',

            hp: stats.hp,
            strength: stats.strength,
            agility: stats.agility,
            luck: stats.luck,

            alive: stats.alive,
            run: stats.run,
            coins: stats.monedas,

            xp: stats.xp,

            response: response.text()
        };

        character[0].hp = Number(stats.hp)
        character[0].strength = Number(stats.strength)
        character[0].agility = Number(stats.agility)
        character[0].luck = Number(stats.luck)
        character[0].alive = stats.alive
        character[0].run = stats.run
        character[0].xp = stats.xp

        // chaequeo de muerte y cambio de vida a 0 para que no explote el puto juego d los cojones y poner todo false por si la IA puto trolea
        if (character[0].hp <= 0) {
            console.log('SE ACTIVA LA MUERTEEEEEEEEEEEEEEEEEEEEEEEEEEEE')
            character[0].alive = false
            character[0].run = false
            character[0].hp = 0
            console.log('MUERTO')
            // Reiniciar el chat para limpiar el historial de la partida terminada
            chat = model.startChat({ history: [] });
            console.log('Historial del chat limpiado (muerte)')
        }

        console.log('character.run: ' + character[0].run + ' y character.alive: ' + character[0].alive)
        if (character[0].run === false && character[0].alive === true) {
            console.log('SE ACTIVA LA VICTORIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
            character[0].xp += 100
            const monedas = await db.query(
                `UPDATE "user" 
                SET coins=coins+$1 
                WHERE id=$2`,
                [stats.monedas, user]
            )
            console.log('MONEDAS TOTALES:' + monedas)
            console.log('VICTORIA VICTORIA VICTORIA VICTORIA VICTORIA')
            // Reiniciar el chat para limpiar el historial de la partida terminada
            chat = model.startChat({ history: [] });
            console.log('Historial del chat limpiado (victoria)')
        }


        const resultchar = await db.query(
            `UPDATE character
   SET
     hp = $1,
     strength = $2,
     agility = $3,
     luck = $4,
     alive = $5,
     run = $6,
     state = $7,
     xp = $8
   WHERE id = $9 RETURNING user_id`,
            [character[0].hp, character[0].strength, character[0].agility, character[0].luck, character[0].alive, character[0].run, character[0].state, character[0].xp, idchar]);

        console.log('Personaje actualizado en la base de datos:', resultchar);
        console.log('USUARIO AÑADIR MONEDAS' + user)
        console.log(`

            Historia:
            ${response.text()}

            Player stats updated:
            Vida: ${gameResponse.hp}
            Fuerza: ${gameResponse.strength}
            Agilidad: ${gameResponse.agility}
            Suerte: ${gameResponse.luck}
            Alive: ${gameResponse.alive}
            `)
        console.log('COINS' + stats.monedas)

        res.json(gameResponse) // Devolvemos el objeto con la respuesta y las estadísticas actualizadas


    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error when answering prompt');
    }

});


//user
app.post('/users', async (req, res) => {
    try {
        console.log('BODY:', req.body);
        const { id, name, coins = 0, xp = 0 } = req.body;

        if (!id || !name)
            return res.status(400).json({ message: 'no hay id o nombre' });

        const exists = await db.query(
            'SELECT * FROM "user" WHERE id = $1',
            [id]
        );

        if (exists.rows.length > 0) {
            // Actualizar el XP del usuario sumando el XP de todos sus personajes
            await updateUserXP(id);
            // Obtener los datos actualizados
            const updated = await db.query(
                'SELECT * FROM "user" WHERE id = $1',
                [id]
            );
            return res.status(200).json({
                message: 'User existe',
                user: updated.rows[0]
            });
        }

        // 1️⃣ Crear usuario
        const created = await db.query(
            'INSERT INTO "user" (id, name, coins, xp) VALUES ($1,$2,$3,$4) RETURNING *',
            [id, name, coins, xp]
        );

        // 2️⃣ Crear inventario vacío
        await db.query(
            'INSERT INTO inventory (user_id) VALUES ($1)',
            [id]
        );

        return res.status(201).json({
            message: 'User + inventory creados',
            user: created.rows[0]
        });

    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});


// Creacion de personajes

app.post('/characters', async (req, res) => {
    try {
        const {
            name,
            hp,
            strength,
            agility,
            luck = 1,
            alive = true,
            run = false,
            state = {},
            user_id,
            xp = 0
        } = req.body;

        if (!name || !user_id) {
            return res.status(400).json({ error: 'name y user_id son obligatorios' });
        }

        const result = await db.query(
            `INSERT INTO character 
         (name, hp, strength, agility, luck, alive, run, state, user_id, xp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
            [name, hp, strength, agility, luck, alive, run, state, user_id, xp]
        );

        if (result.rowCount === 0) {
            return res.status(500).json({ error: 'No se pudo crear el personaje' });
        }

        const newCharacter = result.rows[0];

        res.status(201).json({
            message: 'Personaje creado',
            character: newCharacter   // ← aquí viene el id real
        });

    } catch (err) {
        console.error('Error creando personaje:', err);
        res.status(500).json({ error: 'Error interno al crear personaje' });
    }
});

// obtener el personaje por user_id

app.get('/characters/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            `SELECT * FROM "character" WHERE user_id = $1`,
            [userId]
        );

        res.json({ characters: result.rows });
    } catch (err) {
        console.error('Error fetching characters:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Llamada para eliminar personaje por su ID

app.delete('/characters/:charID', async (req, res) => {

    try {
        const { charID } = req.params;
        // Eliminar el personaje por su ID
        const result = await db.query(
            `DELETE FROM "character" WHERE id = $1 RETURNING *`,
            [charID]
        );

        // Actualizar el XP del usuario después de eliminar el personaje
        if (result.rows.length > 0 && result.rows[0].user_id) {
            await updateUserXP(result.rows[0].user_id);
        }

        res.json({ message: 'Personaje eliminado', character: result.rows[0] });
    } catch (err) {
        console.error('Error eliminando personaje:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//inventory endpoints

app.get('/inventory/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const inv = await db.query(
            `SELECT * FROM inventory WHERE user_id=$1`,
            [userId]
        );

        if (inv.rows.length == 0)
            return res.json({ items: [] });

        const slots = inv.rows[0];

        const itemIds = [
            slots.item_1_id,
            slots.item_2_id,
            slots.item_3_id,
            slots.item_4_id,
            slots.item_5_id,
            slots.item_6_id,
            slots.item_7_id,
            slots.item_8_id,
            slots.item_9_id,
            slots.item_10_id
        ].filter(i => i);

        if (itemIds.length == 0)
            return res.json({ items: [] });

        const items = await db.query(
            `SELECT * FROM item WHERE id = ANY($1)`,
            [itemIds]
        );

        res.json({ items: items.rows });

    } catch (e) {
        console.error(e);
        res.status(500).send("Error inventory");
    }
});

app.post('/inventory/assign', async (req, res) => {
    const { itemId, characterId } = req.body;

    await db.query(
        `UPDATE item 
     SET assigned_character=$1 
     WHERE id=$2`,
        [characterId, itemId]
    );

    res.json({ message: "Asignado" });
});

app.post('/inventory/sell', async (req, res) => {
    const { itemId, price } = req.body;

    // Usuario dueño
    const owner = await db.query(
        `SELECT user_id FROM inventory 
     WHERE $1 IN (
      item_1_id,item_2_id,item_3_id,item_4_id,item_5_id,
      item_6_id,item_7_id,item_8_id,item_9_id,item_10_id
     )`,
        [itemId]
    );

    const userId = owner.rows[0].user_id;

    // Añadir monedas
    await db.query(
        `UPDATE "user" 
     SET coins=coins+$1 
     WHERE id=$2`,
        [price, userId]
    );

    // Vaciar slot
    await db.query(
        `UPDATE inventory SET
      item_1_id = CASE WHEN item_1_id=$1 THEN NULL ELSE item_1_id END,
      item_2_id = CASE WHEN item_2_id=$1 THEN NULL ELSE item_2_id END,
      item_3_id = CASE WHEN item_3_id=$1 THEN NULL ELSE item_3_id END,
      item_4_id = CASE WHEN item_4_id=$1 THEN NULL ELSE item_4_id END,
      item_5_id = CASE WHEN item_5_id=$1 THEN NULL ELSE item_5_id END,
      item_6_id = CASE WHEN item_6_id=$1 THEN NULL ELSE item_6_id END,
      item_7_id = CASE WHEN item_7_id=$1 THEN NULL ELSE item_7_id END,
      item_8_id = CASE WHEN item_8_id=$1 THEN NULL ELSE item_8_id END,
      item_9_id = CASE WHEN item_9_id=$1 THEN NULL ELSE item_9_id END,
      item_10_id= CASE WHEN item_10_id=$1 THEN NULL ELSE item_10_id END
     WHERE user_id=$2`,
        [itemId, userId]
    );

    res.json({ message: "Vendido" });
});

app.post('/market/add', async (req, res) => {
    try {
        const { itemId, price, sellerId } = req.body;

        if (!itemId || !price || !sellerId) {
            return res.status(400).json({ error: 'itemId, price y sellerId son requeridos' });
        }

        const itemCheck = await db.query(
            `SELECT * FROM item WHERE id = $1`,
            [itemId]
        );

        if (itemCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Item no encontrado' });
        }

        if (itemCheck.rows[0].on_market) {
            return res.status(400).json({ error: 'El item ya está en el market' });
        }

        await db.query(
            `UPDATE item 
             SET on_market = true, market_price = $1, seller_id = $2 
             WHERE id = $3`,
            [price, sellerId, itemId]
        );

        console.log(`Item ${itemId} publicado en el market por ${sellerId} a ${price} monedas`);

        res.json({ message: "Publicado en el market exitosamente" });
    } catch (e) {
        console.error('Error publicando item en market:', e);
        res.status(500).json({ error: 'Error al publicar el item en el market' });
    }
});



app.get('/getrankingbestplayers', async (req, res) => {
    console.log('📡 /getrankingbestplayers CALLED');

    try {
        const result = await db.query(`SELECT * FROM character ORDER BY xp DESC;`);

        console.log('RESULT FROM DB:', result);

        res.json(result.rows);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error getting ranking' });
    }
});

app.get('/item-shop', async (req, res) => {
    try {
        const comunes = (await db.query(`SELECT * FROM item WHERE rareza = 'común' AND character_id IS NULL`)).rows;
        const pocoComunes = (await db.query(`SELECT * FROM item WHERE rareza = 'poco común' AND character_id IS NULL`)).rows;

        const excludeIds = new Set();
        const items = [];

        // Seleccionar 6 ítems con probabilidad: 70% común, 30% poco común
        for (let i = 0; i < 6; i++) {
            let selected = null;

            // 70% probabilidad de común, 30% de poco común
            if (Math.random() < 0.7) {
                let comunesDisponibles = comunes.filter((item: any) => !excludeIds.has(item.id));
                if (comunesDisponibles.length > 0) {
                    const idx = Math.floor(Math.random() * comunesDisponibles.length);
                    selected = comunesDisponibles[idx];
                } else {
                    let pocoComunesDisponibles = pocoComunes.filter((item: any) => !excludeIds.has(item.id));
                    if (pocoComunesDisponibles.length > 0) {
                        const idx = Math.floor(Math.random() * pocoComunesDisponibles.length);
                        selected = pocoComunesDisponibles[idx];
                    }
                }
            } else {
                let pocoComunesDisponibles = pocoComunes.filter((item: any) => !excludeIds.has(item.id));
                if (pocoComunesDisponibles.length > 0) {
                    const idx = Math.floor(Math.random() * pocoComunesDisponibles.length);
                    selected = pocoComunesDisponibles[idx];
                } else {
                    let comunesDisponibles = comunes.filter((item: any) => !excludeIds.has(item.id));
                    if (comunesDisponibles.length > 0) {
                        const idx = Math.floor(Math.random() * comunesDisponibles.length);
                        selected = comunesDisponibles[idx];
                    }
                }
            }

            if (selected) {
                items.push(selected);
                excludeIds.add(selected.id);
            }
        }

        const currentDate = new Date().toISOString().slice(0, 10);

        res.json({ items, date: currentDate });
    } catch (e) {
        console.error(e);
        res.status(500).send("Error fetching item shop");
    }
});

app.post('/item-shop', async (req, res) => {
    console.log('item-shop POST')
    try {
        const {
            userId,
            itemId,
            characterId,
            isBox,
            price,
            tier,
            boxType
        } = req.body;

        console.log('isBox: ' + isBox)


        if (!userId || !characterId || (!itemId && !isBox)) {
            return res.status(400).json({
                message: 'userId, characterId y (itemId o isBox) son requeridos'
            });
        }

        const userResult = await db.query('SELECT coins FROM "user" WHERE id = $1', [userId]);
        console.log('userResult: ' + userResult)
        if (userResult.rows.length === 0) {
            console.log('NO USER')
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const userCoins = userResult.rows[0].coins;
        console.log('userCoins: ' + userCoins)

        const characterResult = await db.query(
            'SELECT * FROM character WHERE id = $1 AND user_id = $2',
            [characterId, userId]
        );
        console.log('characterResult: ' + characterResult)
        if (characterResult.rows.length === 0) {
            console.log('NO CHARACTER')
            return res.status(404).json({ message: 'Personaje no encontrado o no te pertenece' });
        }

        let finalPrice = 0;
        let itemToCreate = null;

        if (isBox === true) {
            const charXP = characterResult.rows[0].xp;

            if (tier === 'Hierro' && charXP < 500) {
                return res.status(403).json({ message: 'El personaje no tiene suficiente XP (Mín. 500)' });
            }
            if (tier === 'Esmeralda' && charXP < 1000) {
                return res.status(403).json({ message: 'El personaje no tiene suficiente XP (Mín. 1000)' });
            }
            console.log('isBox EMPEZANDO')
            finalPrice = price;

            const promptActualizado = `
                Generame un item de tipo ${boxType}, este item viene de una caja que puede ser de 3 tipos madera, hierro o esmeralda 
        cada una de estas cajas tiene una probabilidad de item de distinta calidad, la de madera tiene un 50% de dar un item comun,
        un 30% de dar un item poco comun, un 15% de dar un item raro, un 4% de dar un item epico, un 0.9% de dar un item legendario y 
        un 0.1% de dar un item mitico, la de hierro tiene un 25% de dar un item comun,
        un 30% de dar un item poco comun, un 25% de dar un item raro, un 15% de dar un item epico, un 4% de dar un item legendario y 
        un 1% de dar un item mitico y la de esmeralda tiene un 5% de dar un item comun,
        un 10% de dar un item poco comun, un 40% de dar un item raro, un 25% de dar un item epico, un 15% de dar un item legendario y 
        un 5% de dar un item mitico, esta caja que hemos abierto es de tipo ${tier}, cada rareza de item es mejor que la anterior,
        esto significa que el precio es mayor dependiendo de cada rareza, comun 5-15, poco comun 20-40, raro 50-80, epico 90-110, legendario 120-200,
        mitico de 210-500, tambien la hablidad que tienen que se definira en la descripcion varia caundo mayor sea la rareza mejor sera la habilidad,
        por ejemplo un item comun puede ser una pocion que te cura si es objeto el tipo de item, un casco de madera si es armadura el tipo o 
        una espada rota si es arma el tipo de item, y si es un item de rareza mitico pues el objeto puede ser un amuleto que le roba vida a los enemigos, 
        una armadura que cuando te golpean hace daño al enemigo o lo envenena y si es un arma una espada mitica que atraviesa cualquier material y 
        cada vez que la usas contra un enemigo aumenta tu fuerza. Piensa que estamos en un mundo de fantasia de humanos, elfos, orcs, goblins,
        golems, entes de energia magica, magos, brujas, trasgos, dragones, todo en un ambiente medieval magico de fantasia, asi que los items deben
        de estar relacionados con este mundo de fantasia en el que estamos, tambien piensa que el item sera untlizado luego en una partida 
        de un juego de rol ambientado en lo anterior por eso necesitamos un balance dependiendo de la rareza de cada item. Para que entiendas 
        un poco mas como funciona el juego y puedas generar los ojetos de mejor manera basandote en las reglas del juego y variables que contiene,
        es un juego de rol el cual va por turnos, los items no pueden tener efectos de turnos, es decir no pueden cambiar cosas por un cierto numero de turnos
        (ejemplo: aumenta el daño durante dos turnos, esto NO LO PUEDE HACER), tampoco puede variar las estadisticas del personaje las cuales son vida, fuerza, 
        agilidad y suerte, al obtenerlo, pero si despues de su uso por ejemplo, un martillo que despues de usarlo sube la fuerza +5, esto si que podri suceder 
        lo q no podria suceder es una armadura que augmenta la vida un 10%, eso no, pero si que puede ser una armadura que reduce el daño recibido.
        A la hora de subir estadisticas, ten en cuent aque las estadisticas por base son todas 100, eso quiere decir que subir una estadistica 
        +5 puntos es mucho, asi q ten en cuenta eso a la hora de creear el objeto y mantener un balance, las describciones no tienen que ser muy largas, intenta 
        limitarlas a 50 palabras mas o menos como maximo 75 palabras. Ahora con todo esto generame el objeto.
        Devuélveme OBLIGATORIAMENTE un JSON VÁLIDO, sin ningún texto adicional antes o después,
        Con el item conseguido tras la apertura de la caja
        El formato debe ser EXACTAMENTE este:
        {
            "name": string,
            "description": string,
            "price": number,
            "rareza": string
        }
        NO INCLUYAS NINGÚN TIPO DE TEXTO ADICIONAL DE JSON O DE COMILLAS
        NO envíes texto fuera del JSON.
        NO encierres el JSON en comillas ni en bloques de código
        NO añadas nada mas que lo mostrado en el formato porfavor necesito poder trabajar con el JSON.
        QUERO QUE TU RESPUESTA SEA UNICAMENTE RELLENAR EL JSON DEFINIDO ANTERIORMENTE CON LOS VALORES DEL ITEM CONSEGUIDO.
        `;

            const chat = model.startChat();
            const cajaResult = await chat.sendMessage(promptActualizado);
            const rawText = cajaResult.response.text();

            const cleanCajaResult = extractBetweenBraces(rawText);
            console.log('cleanCajaResult: ' + cleanCajaResult)

            if (!cleanCajaResult) {
                console.log('La IA no genera item correcto')
                return res.status(500).json({ message: 'La IA no generó un formato válido' });
            }

            itemToCreate = JSON.parse(cleanCajaResult);

        }
        else {
            const itemResult = await db.query(
                'SELECT * FROM item WHERE id = $1 AND character_id IS NULL',
                [itemId]
            );
            if (itemResult.rows.length === 0) {
                return res.status(404).json({ message: 'Item no encontrado' });
            }
            const itemTemplate = itemResult.rows[0];
            finalPrice = itemTemplate.price;
            itemToCreate = {
                name: itemTemplate.name,
                description: itemTemplate.description,
                rareza: itemTemplate.rareza,
                price: itemTemplate.price
            };
        }

        if (userCoins < finalPrice) {
            return res.status(400).json({ message: 'No tienes suficientes monedas' });
        }


        await db.query('UPDATE "user" SET coins = coins - $1 WHERE id = $2', [finalPrice, userId]);

        const newItemResult = await db.query(
            `INSERT INTO item (name, description, rareza, price, character_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [itemToCreate.name, itemToCreate.description, itemToCreate.rareza, itemToCreate.price, characterId]
        );
        console.log('FINALIZADO TODO OK')
        res.json({
            message: 'Compra exitosa',
            coinsRemaining: userCoins - finalPrice,
            item: newItemResult.rows[0]
        });

    } catch (e) {
        console.error('Error procesando compra:', e);
        res.status(500).json({ message: 'Error interno al procesar la compra' });
    }
});

function extractBetweenBraces(text: string) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        return text.substring(firstBrace, lastBrace + 1);
    }
    return null;
}

app.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            'SELECT * FROM "user" WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await updateUserXP(userId);

        const updated = await db.query(
            'SELECT * FROM "user" WHERE id = $1',
            [userId]
        );

        res.json({ user: updated.rows[0] });
    } catch (e) {
        console.error(e);
        res.status(500).send('Error obteniendo usuario');
    }
});

app.get('/getcharactersbyemail/:email', async (req, res) => {
    const { email } = req.params;

    console.log('EMAIL RECIBIDO:', email);

    try {

        const charactersResult = await db.query(
            'SELECT * FROM character WHERE user_id = $1',
            [email]
        );

        const characterIds = charactersResult.rows.map((c: any) => c.id);


        if (characterIds.length === 0) {
            return res.json({
                characters: [],
                items: []
            });
        }

        console.log(characterIds)
        const itemsResult = await db.query(
            'SELECT * FROM item WHERE character_id = ANY($1)',
            [characterIds]
        );


        res.json({
            characters: charactersResult.rows,
            items: itemsResult.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error getting characters/items' });
    }
});

app.get('/market/items', async (req, res) => {
    try {
        // Selecciona los ítems en venta y une con el usuario vendedor
        const result = await db.query(`
            SELECT 
                item.id,
                item.name,
                item.description,
                item.rareza,
                item.price,
                item.market_price,
                item.seller_id,
                u.name AS seller_name
            FROM item
            LEFT JOIN "user" u ON item.seller_id = u.id
            WHERE item.on_market = true
        `);

        res.json({ items: result.rows });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error al obtener items del market' });
    }
});

app.get('/sellitem/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params
        console.log('Item id' + itemId)
        const item = await db.query(`
        SELECT price, character_id FROM item WHERE id= $1
        `, [itemId])

        console.log(item.rows)

        const rows = item.rows ?? item[0];
        const price = rows[0].price;
        const character = rows[0].character_id;

        const user = await db.query('SELECT user_id from character WHERE id = $1', [character])
        const rows2 = user.rows ?? user[0];
        const id = rows2[0].user_id;

        await db.query(
            'UPDATE "user" SET coins = coins + $1 WHERE id = $2',
            [price, id]
        );

        const result = await db.query(`
        DELETE FROM item WHERE id= $1
        `, [itemId])
        res.json({ result });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error al vender item' });
    }
})

//funcion compra de item en market
app.post('/market/buyitem', async (req, res) => {
    try {
        const { itemId, buyerId, characterId } = req.body;
        // Obtener el ítem
        const itemResult = await db.query(
            'SELECT * FROM item WHERE id = $1 AND on_market = true',
            [itemId]
        );

        if (itemResult.rows.length === 0) {
            return res.status(404).json({ message: 'Item no encontrado en el market' });
        }
        const item = itemResult.rows[0];
        const itemPrice = item.market_price;

        const buyerResult = await db.query(
            'SELECT coins FROM "user" WHERE id = $1',
            [buyerId]
        );

        if (buyerResult.rows.length === 0) {
            console.log('Buyer ID not found:', buyerId);
            return res.status(404).json({ message: 'Comprador no encontrado', });

        }

        const characterResult = await db.query(
            'SELECT * FROM character WHERE id = $1',
            [characterId]
        );
        if (characterResult.rows.length === 0) {
            return res.status(404).json({ message: 'Character no encontrado' });
        }

        const buyerCoins = buyerResult.rows[0].coins;
        if (buyerCoins < itemPrice) {
            return res.status(400).json({ message: 'No tienes suficientes monedas' });
        }

        // Restar monedas al comprador
        await db.query(
            'UPDATE "user" SET coins = coins - $1 WHERE id = $2',
            [itemPrice, buyerId]
        );
        // Añadir monedas al vendedor
        await db.query(
            'UPDATE "user" SET coins = coins + $1 WHERE id = $2',
            [itemPrice, item.seller_id]
        );

        await db.query(
            'UPDATE item SET character_id = $2, on_market = false, market_price = NULL, seller_id = NULL WHERE id = $1',
            [itemId, characterId]
        );
        res.json({ message: 'Compra exitosa' });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error al procesar la compra' });
    }
});

//endpoint para cambiar el item de un personaje a otro del mismo usuario
app.post('/changeitem', async (req, res) => {
    try {
        const { itemId, fromCharacterId, toCharacterId, userId } = req.body;

        if (!itemId || !fromCharacterId || !toCharacterId || !userId) {
            return res.status(400).json({ message: 'itemId, fromCharacterId, toCharacterId y userId son requeridos' });
        }

        const itemResult = await db.query(
            'SELECT * FROM item WHERE id = $1 AND character_id = $2 AND on_market = false',
            [itemId, fromCharacterId]
        );
        if (itemResult.rows.length === 0) {
            return res.status(404).json({ message: 'Item no encontrado en el personaje o está en el market' });
        }

        const charactersResult = await db.query(
            'SELECT id, user_id FROM character WHERE id = ANY($1)',
            [[fromCharacterId, toCharacterId]]
        );

        if (charactersResult.rows.length !== 2) {
            return res.status(404).json({ message: 'Uno o ambos personajes no existen' });
        }

        const fromChar = charactersResult.rows.find((c: any) => c.id == fromCharacterId);
        const toChar = charactersResult.rows.find((c: any) => c.id == toCharacterId);

        if (fromChar.user_id !== userId || toChar.user_id !== userId) {
            return res.status(403).json({ message: 'Uno o ambos personajes no pertenecen al usuario' });
        }

        if (fromChar.user_id !== toChar.user_id) {
            return res.status(403).json({ message: 'No puedes transferir items entre personajes de diferentes usuarios' });
        }
        await db.query(
            'UPDATE item SET character_id = $1 WHERE id = $2',
            [toCharacterId, itemId]
        );

        res.json({ message: 'Item transferido exitosamente' });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error al transferir el item' });
    }
});

//endpoint para retirar el item del market y devolverlo al personaje original
app.post('/market/removeitem', async (req, res) => {
    try {
        const { itemId, sellerId } = req.body;

        if (!itemId || !sellerId) {
            return res.status(400).json({ message: 'itemId y sellerId son requeridos' });
        }

        const itemResult = await db.query(
            'SELECT * FROM item WHERE id = $1 AND seller_id = $2 AND on_market = true',
            [itemId, sellerId]
        );
        if (itemResult.rows.length === 0) {
            return res.status(404).json({ message: 'Item no encontrado en el market para este vendedor' });
        }
        const item = itemResult.rows[0];

        if (!item.character_id) {
            return res.status(400).json({ message: 'El item no tiene un personaje asignado' });
        }
        const charResult = await db.query(
            'SELECT user_id FROM character WHERE id = $1',
            [item.character_id]
        );
        if (charResult.rows.length === 0) {
            return res.status(404).json({ message: 'El personaje original ya no existe' });
        }
        if (charResult.rows[0].user_id !== sellerId) {
            return res.status(403).json({ message: 'El personaje no pertenece al vendedor' });
        }
        await db.query(
            'UPDATE item SET on_market = false, market_price = NULL, seller_id = NULL WHERE id = $1',
            [itemId]
        );

        res.json({
            message: 'Item retirado del market exitosamente',
            characterId: item.character_id
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error al retirar el item del market' });
    }
});

app.get("/music/:charId", async (req, res) => {
    try {
        const { charId } = req.params;
        let narrative = String(req.query.narrative || "");

        if (!charId) {
            return res.status(400).json({ error: "charId es requerido" });
        }

        const charResult = await db.query(
            `SELECT id, name, run, state FROM "character" WHERE id = $1`,
            [charId],
        );

        if (charResult.rows.length === 0) {
            return res.status(404).json({ error: "Personaje no encontrado" });
        }

        const char = charResult.rows[0];

        if (!narrative || narrative.trim().length === 0) {
            console.log("No hay narrativa, devolviendo Exploración por defecto");
            return res.json({ music: "Exploración" });
        }

        if (narrative.length > 2000) {
            narrative = "..." + narrative.slice(-2000);
            console.log("Narrativa recortada a últimos 2000 caracteres");
        }

        const musicModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let contextPrompt = `Basándote en la siguiente narrativa de un juego de rol de fantasía, responde SOLO con una de estas palabras exactas:
"Combate", "Exploración", "Misterio", "Descanso" o "Tensión".

IMPORTANTE:
- Analiza lo que está ocurriendo en la PARTE MÁS RECIENTE de la narrativa.
- La narrativa tiene PRIORIDAD sobre el estado del personaje.
- La música representa el ambiente y la emoción predominante de la escena actual.
- NO asumas resultados futuros ni decisiones aún no tomadas.

NARRATIVA RECIENTE:
${narrative}

INFORMACIÓN DEL PERSONAJE:
- Nombre: ${char.name}
- Estado: ${char.state ? char.state.name : "Normal"}
${char.state && char.state.description ? `- ${char.state.description}` : ""}

CATEGORÍAS DE MÚSICA (en orden de prioridad):
Combate > Tensión > Misterio > Exploración > Descanso

DEFINICIONES:

- "Combate":
  El enemigo o el personaje YA ha iniciado una acción hostil directa.
  Incluye: atacar, abalanzarse, disparar, lanzar hechizos, intercambio inminente de golpes.
  Usa "Combate" incluso si la narrativa termina con opciones A, B, C
  SIEMPRE que una acción hostil ya haya comenzado.

- "Tensión":
  El peligro es INMINENTE pero aún NO ha comenzado el combate.
  Ejemplos: persecuciones, enemigos visibles acercándose,
  trampas activándose, cuenta regresiva, huida bajo presión.

- "Misterio":
  Situaciones inquietantes o desconocidas SIN acción hostil directa.
  Sonidos extraños, presencias ocultas, lugares oscuros,
  indicios de peligro sin confrontación.

- "Exploración":
  Desplazamiento o descubrimiento sin carga emocional fuerte.
  Viajar, caminar, observar paisajes, explorar zonas seguras o conocidas.

- "Descanso":
  Escenas SEGURAS y estables, sin peligro ni inquietud.
  Conversaciones amistosas, tabernas, mercados, campamentos protegidos,
  planificación tranquila.

REGLAS CLAVE:
- NO es Combate: trampas, encantamientos automáticos, defensas mágicas pasivas, daño ambiental sin enemigo activo

- EXCEPCIÓN IMPORTANTE - Detección de Jefes:
    Si la narrativa contiene indicadores de que el personaje ha encontrado un JEFE, usa "Combate" inmediatamente o "Tensión" como veas mejor.
    Indicadores de jefe: frases como "has encontrado un jefe", "ADVERTENCIA: HAS ENCONTRADO UN JEFE", 
    "jefe", "boss", o el nombre de una criatura seguido de puntos de vida altos (ejemplo: "Sombra del Vacío: 200 de vida").
    Esta regla tiene PRIORIDAD sobre la definición normal de "Combate".

- Si la narrativa termina con opciones A, B, C y NO hay acción hostil directa iniciada por nadie, y el peligro inmediato ha pasado (por ejemplo, tras resolver un encuentro de forma pacífica, obtener una recompensa o cuando el ambiente es seguro y hay varias rutas para elegir), PRIORIZA "Exploración" sobre "Misterio".
    Usa "Misterio" solo si el ambiente sigue siendo inquietante, hay secretos sin resolver o el entorno es claramente enigmático.

- Si varias categorías aplican, elige la MÁS ALTA según la prioridad:
    Combate > Tensión > Misterio > Exploración > Descanso

Responde ÚNICAMENTE con UNA de estas palabras exactas y nada más.
`;

        const result = await musicModel.generateContent(contextPrompt);
        let musicChoice = result.response.text().trim();

        const validChoices = ["Combate", "Exploración", "Misterio", "Descanso", "Tensión"];

        musicChoice = musicChoice.replace(/[\s\n\r]+/g, "");

        const found = validChoices.find(opt => musicChoice.toLowerCase() === opt.toLowerCase());

        const finalChoice = found || "Exploración";

        console.log("Narrativa recibida (últimos 150 chars):", narrative.slice(-150));
        console.log("Estado del personaje:", char.state?.name || "Normal");
        console.log("Respuesta IA bruta:", musicChoice);
        console.log("Música final para personaje", charId, ":", finalChoice);

        res.json({ music: finalChoice });
    } catch (error) {
        console.error("Error obteniendo música:", error);
        res.status(500).json({ error: "Error generando música" });
    }
});

const port = 3000;

app.listen(port, () =>
    console.log(`App listening on PORT ${port}.

    ENDPOINTS:
    -   /getrankingbestplayers
    -   /gemini
    -   /geminiresponse
    -   
     `));


// const itemsPrompt = `
//         Generame un item de tipo {{TIPOCAJA}}, este item viene de una caja que puede ser de 3 tipos madera, hierro o esmeralda
//         cada una de estas cajas tiene una probabilidad de item de distinta calidad, la de madera tiene un 50% de dar un item comun,
//         un 30% de dar un item poco comun, un 15% de dar un item raro, un 4% de dar un item epico, un 0.9% de dar un item legendario y
//         un 0.1% de dar un item mitico, la de hierro tiene un 25% de dar un item comun,
//         un 30% de dar un item poco comun, un 25% de dar un item raro, un 15% de dar un item epico, un 4% de dar un item legendario y
//         un 1% de dar un item mitico y la de esmeralda tiene un 5% de dar un item comun,
//         un 10% de dar un item poco comun, un 40% de dar un item raro, un 25% de dar un item epico, un 15% de dar un item legendario y
//         un 5% de dar un item mitico, esta caja que hemos abierto es de tipo {{CALIDADCAJA}}, cada rareza de item es mejor que la anterior,
//         esto significa que el precio es mayor dependiendo de cada rareza, comun 5-15, poco comun 20-40, raro 50-80, epico 90-110, legendario 120-200,
//         mitico de 210-500, tambien la hablidad que tienen que se definira en la descripcion varia caundo mayor sea la rareza mejor sera la habilidad,
//         por ejemplo un item comun puede ser una pocion que te cura si es objeto el tipo de item, un casco de madera si es armadura el tipo o
//         una espada rota si es arma el tipo de item, y si es un item de rareza mitico pues el objeto puede ser un amuleto que le roba vida a los enemigos,
//         una armadura que cuando te golpean hace daño al enemigo o lo envenena y si es un arma una espada mitica que atraviesa cualquier material y
//         cada vez que la usas contra un enemigo aumenta tu fuerza. Piensa que estamos en un mundo de fantasia de humanos, elfos, orcs, goblins,
//         golems, entes de energia magica, magos, brujas, trasgos, dragones, todo en un ambiente medieval magico de fantasia, asi que los items deben
//         de estar relacionados con este mundo de fantasia en el que estamos, tambien piensa que el item sera untlizado luego en una partida
//         de un juego de rol ambientado en lo anterior por eso necesitamos un balance dependiendo de la rareza de cada item.
//         Devuélveme OBLIGATORIAMENTE un JSON VÁLIDO, sin ningún texto adicional antes o después,
//         Con el item conseguido tras la apertura de la caja
//         El formato debe ser EXACTAMENTE este:
//         {
//             "name": string,
//             "description": string,
//             "price": number,
//             "rareza": string
//         }
//         NO INCLUYAS NINGÚN TIPO DE TEXTO ADICIONAL DE JSON O DE COMILLAS
//         NO envíes texto fuera del JSON.
//         NO encierres el JSON en comillas ni en bloques de código
//         NO añadas nada mas que lo mostrado en el formato porfavor necesito poder trabajar con el JSON.
//         QUERO QUE TU RESPUESTA SEA UNICAMENTE RELLENAR EL JSON DEFINIDO ANTERIORMENTE CON LOS VALORES DEL ITEM CONSEGUIDO.
//         `;
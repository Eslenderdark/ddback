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

const genAI = new GoogleGenerativeAI(env.environment.api_key)
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
las acciones realizadas solo en rondas uy altas.
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
    xp: 0,
    response: ''
}
let userpromt = '' // Variable para almacenar la respuesta del usuario
const chat = model.startChat({ //Creamos el chat donde se guardan las conversaciones para que el LLM tenga contexto y responda coherentemente
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
        const result = await chat.sendMessage(userpromt); // Se lo enviamos
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
            const result = await chat.sendMessage(userpromt); // Se lo enviamos
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

            xp: stats.xp,

            response: response.text()
        };

        const coins = stats.monedas



        character[0].hp = Number(gameResponse.hp)
        character[0].strength = Number(gameResponse.strength)
        character[0].agility = Number(gameResponse.agility)
        character[0].luck = Number(gameResponse.luck)
        character[0].alive = (gameResponse.alive === true || gameResponse.alive === false)
        character[0].xp = gameResponse.xp

        res.json(gameResponse) // Devolvemos el objeto con la respuesta y las estadísticas actualizadas

        // chaequeo de muerte y cambio de vida a 0 para que no explote el puto juego d los cojones y poner todo false por si la IA puto trolea
        if (character[0].hp <= 0) {
            character[0].alive = false
            character[0].run = false
            character[0].hp = 0
            console.log('MUERTO')
        }

        //chequeo de victoria y añadir xp extra
        if (character[0].run === false && character[0].alive === true) {
            character[0].xp += 100
            await db.query(
                `UPDATE "user"
                SET 
                coins = $1 WHERE id = $2`,
                [coins,user]
            )
            
            console.log('VICTORIA')
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
        console.log('USUARIO AÑADIR MONEDAS'+ user)
        console.log('COINS' + coins)
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
    const { itemId, price } = req.body;

    await db.query(
        `UPDATE item 
     SET on_market=true, market_price=$1 
     WHERE id=$2`,
        [price, itemId]
    );

    res.json({ message: "Publicado" });
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

function extractBetweenBraces(text: string): string | null {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
        return null;
    }

    return text.slice(start, end + 1);
}

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
    try {
        const { userId, itemId, characterId } = req.body;

        if (!userId || !itemId || !characterId) {
            return res.status(400).json({ message: 'userId, itemId y characterId son requeridos' });
        }
        // usuario existe y monedas
        const userResult = await db.query(
            'SELECT coins FROM "user" WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const userCoins = userResult.rows[0].coins;
        // personaje existe y es de el usuario
        const characterResult = await db.query(
            'SELECT * FROM character WHERE id = $1 AND user_id = $2',
            [characterId, userId]
        );
        if (characterResult.rows.length === 0) {
            return res.status(404).json({ message: 'Personaje no encontrado o no te pertenece' });
        }
        // item existe y obtiene datos
        const itemResult = await db.query(
            'SELECT * FROM item WHERE id = $1 AND character_id IS NULL',
            [itemId]
        );
        if (itemResult.rows.length === 0) {
            return res.status(404).json({ message: 'Item no encontrado' });
        }
        const itemTemplate = itemResult.rows[0];
        const itemPrice = itemTemplate.price;
        // el usuario tiene suficientes monedas para obtener el item
        if (userCoins < itemPrice) {
            return res.status(400).json({ message: 'No tienes suficientes monedas' });
        }
        // quitar monedas al usuario
        await db.query(
            'UPDATE "user" SET coins = coins - $1 WHERE id = $2',
            [itemPrice, userId]
        );
        // Duplicar el ítem añadiendo el character_id del personaje
        const newItemResult = await db.query(
            `INSERT INTO item (name, description, rareza, price, character_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [itemTemplate.name, itemTemplate.description, itemTemplate.rareza, itemTemplate.price, characterId]
        );

        res.json({
            message: 'Compra exitosa',
            coinsRemaining: userCoins - itemPrice,
            item: newItemResult.rows[0]
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error al procesar la compra' });
    }
});

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

    const sell = await db.query(
  'UPDATE "user" SET coins = coins + $1 WHERE id = $2',
  [price, id]
);

    console.log('Item sold' + price + " USER "+ id)

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

const port = 3000;

app.listen(port, () =>
    console.log(`App listening on PORT ${port}.

    ENDPOINTS:
    -   /getrankingbestplayers
    -   /gemini
    -   /geminiresponse
    -   
     `));
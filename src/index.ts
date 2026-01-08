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
(mas posibilidades de que salga beneficiosa) o que consigas mejores recompensas o mejoras de estadísticas en cada elección, 
en cada turno tienes que mostrarme las estadísticas y como han variado dependiendo de la elección, las estadísticas se te 
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
del personaje sino que simplemente te ayude a sumergirte mas en la narrativa de la partida. En este intento no no esperes mas arrays.
Array:
[
  {
    id: 1,
    nombre: "Caudillo",
    vida: 100,
    fuerza: 100,
    agilidad: 100,
    suerte: 100,
    alive: true,
    run: true,
    estado: {
      nombre: "",
      descripcion: ""
    }
  }
];` // Prompt inicial

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Escogemos el modelo del LLM que queremos usar
let gameResponse = {
    player_id: '',
    descripcion: '',
    vida: '',
    fuerza: '',
    agilidad: '',
    suerte: '',
    alive: '',
    run: 0,
    response: ''
}
let userpromt = '' // Variable para almacenar la respuesta del usuario
const chat = model.startChat({ //Creamos el chat donde se guardan las conversaciones para que el LLM tenga contexto y responda coherentemente
    history: [], // Empieza vacia
})



app.get('/gemini', async (req, res) => { // Endpoint para iniciar la aventura
    console.log(`Petición recibida al endpoint GET /gemini`);

    //  Enviar personaje como objeto por API

    //  Genera la aventura inicial

    try {
        const result = await chat.sendMessage(promtNarrativa); // Enviamos el prompt inicial al LLM
        const response = await result.response;

        res.json(response.text()) // El ".text" es la respuesta string del LLM

        //Enviar el array antes de elegir las opciones
        console.log('Respuesta enviada al cliente: ' + JSON.stringify(response.text()));

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error on the initial promt');
    }

});


app.get('/geminiresponse/:option', async (req, res) => { // Llamada principal para responder a las opciones del usuario
    console.log(`Petición recibida al endpoint GET /geminiresponse/:option`);

    try {
        userpromt = '' // Vaciamos la variable para que no se acumule la respuesta anterior
        userpromt = req.params.option



        console.log('Respuesta efectuada cargando promt...')
        const result = await chat.sendMessage(userpromt); // Se lo enviamos
        const response = await result.response;

        // Preguntamos vida
        const vidaPrompt = await chat.sendMessage('Dame solo el numero de la vida actual, despues de la última acción realizada sin ningún texto adicional ni explicación, solo el número.'); // Pedimos solo la vida actual
        const vidaResponse = await vidaPrompt.response;

        // Preguntamos fuerza

        const fuerzaPrompt = await chat.sendMessage('Dame solo el numero de la fuerza actual, despues de la última acción realizada sin ningún texto adicional ni explicación, solo el número.'); // Pedimos solo la fuerza actual
        const fuerzaResponse = await fuerzaPrompt.response;

        // Preguntamos agilidad

        const agilidadPrompt = await chat.sendMessage('Dame solo el numero de la agilidad actual, despues de la última acción realizada sin ningún texto adicional ni explicación, solo el número.'); // Pedimos solo la agilidad actual
        const agilidadResponse = await agilidadPrompt.response;

        // Preguntamos suerte

        const suertePrompt = await chat.sendMessage('Dame solo el numero de la suerte actual, despues de la última acción realizada sin ningún texto adicional ni explicación, solo el número.');
        const suerteResponse = await suertePrompt.response;

        // Preguntamos si estamos vivos

        const alivePrompt = await chat.sendMessage('Dime solo true o false si el jugador sigue vivo despues de la última acción realizada, sin ningún texto adicional ni explicación, solo true o false.'); // Pedimos solo si estamos vivos
        const aliveResponse = await alivePrompt.response;

        gameResponse = {
            player_id: '', // lo recibimos, de momento lo dejamos vacío
            descripcion: '', // lo mismo
            vida: vidaResponse.text(),
            fuerza: fuerzaResponse.text(),
            agilidad: agilidadResponse.text(),
            suerte: suerteResponse.text(),
            alive: aliveResponse.text(),
            run: 0,
            response: response.text()
        }

        res.json(gameResponse) // Devolvemos el objeto con la respuesta y las estadísticas actualizadas

        console.log(`

            Historia:
            ${response.text()}

            Player stats updated:
            Vida: ${gameResponse.vida}
            Fuerza: ${gameResponse.fuerza}
            Agilidad: ${gameResponse.agilidad}
            Suerte: ${gameResponse.suerte}
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
        const id = req.body.id;
        const name = req.body.name;
        const coins = req.body.coins || 0;

        if (!id || !name) return res.status(400).json({ message: 'no hay id o nombre' });

        const exists = await db.query('SELECT * FROM user WHERE id = $1', [id]);
        if (exists.rows.length > 0) {
            return res.status(200).json({ message: 'User existe', user: exists.rows[0] });
        }

        const created = await db.query(
            'INSERT INTO user (id, name, coins) VALUES ($1, $2, $3) RETURNING *',  // ← Agregar coins
            [id, name, coins]
        );

        return res.status(201).json({ message: 'User created', user: created.rows[0] });
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});



const port = 3000;

app.listen(port, () =>
    console.log(`App listening on PORT ${port}.

    ENDPOINTS:
    
    -   /gemini
    -   /geminiresponse
     `));
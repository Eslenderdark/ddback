"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var generative_ai_1 = require("@google/generative-ai");
var app = express_1.default();
app.use(cors_1.default());
var body_parser_1 = __importDefault(require("body-parser"));
var jsonParser = body_parser_1.default.json();
var api_key = 'AIzaSyBGYJK-TB4XMnrRIeFdLi2-zIJscOO1sA8';
var genAI = new generative_ai_1.GoogleGenerativeAI(api_key);
var promtNarrativa = "\nCreame el comienzo de una historia de fantasia estilo dungeons and dragons para un juego, narrame la historia como si ya estuviese en el juego, \nal final de esta historia necesito que me des tres opciones distintas de acciones que pueda realizar el jugador, estas acciones deben de tener \ncoherencia con la historia que me estas contando y tienen que tener distintos desenlaces, estos desenlaces pueden aumentar las estadisticas del \njugador de distintas formas, aplicarle efectos de estado negativos como congelacion o envenenamiento, aplicarle elementos de estados positivos \ncomo curacion o fuerza, aplicarle mejoras de estadisticas permanentes como la vida o el da\u00F1o o de incluso causar la muerte del personaje, \npiensa que cada una de las acciones que pueda realizar el personaje luego, la escogida, sera la accion que realizara a continuacion y tiene que tener un desarrollo coherente\n, no me muestres lo que va a ocurrir a continuacion con cada accion debe de ser sorpresa,no muestres como pueden variar las estad\u00EDsticas del jugador con cada decisi\u00F3n deben \nde ser sorpresa, las decisiones deben de ser la primera la A, la segunda la B y la tercera la C, recuerda que debe de ser una historia principal que muestra \nal jugador en una situacion donde deba de tomar una decision, elabora bastante esta primera situacion para que el jugador se sumerja en la historia, si el jugador \nmuere no le dejes escoger mas opciones, envia un mensaje al final del texto en may\u00FAsculas que diga DEAD, el jugador comienza con 100 puntos de vida, las acciones \npueden sub\u00EDrselos, baj\u00E1rselos o dejarlos estables, el jugador muere cuando estos puntos debida caen a 0 o por debajo, ten en cuenta que la perdida de vida debe de ser \ncoherente a la accion realizada por o al personaje (ejemplo: ataque de drag\u00F3n = -100 de puntos de vida / ataque de goblin = -10 de puntos de vida), tambi\u00E9n los rivales \nque vaya encontrando el jugador por el camino deben de tener unos puntos de vida propios, coherentes con su personaje y estado \n(ejemplo: drag\u00F3n 500 puntos de vida / goblin 10 puntos de vida), tambi\u00E9n tiene que haber una posibilidad de encontrar jefes por el camino, estos \njefes solo podr\u00E1n aparecer despu\u00E9s de las primeras 3 decisiones del jugador (no antes), se deber\u00E1 de avisar al jugador de que esta contra un jefe, \nestos jefes deber\u00E1n de ir aumentando de estad\u00EDsticas a medida que se vayan aumentando las decisiones del jugador \n(ejemplo: decisi\u00F3n numero cuatro jefe sencillo / decisi\u00F3n numero 20 jefe mas complicado), las decisiones tambi\u00E9n tienen que se coherentes en cuanto a riesgo, \nuna decisi\u00F3n que contiene un riesgo mayor debe de dar una recompensa mayor y si sale mal un castigo del la misma magnitud de la cual seria la recompensa, \neste nivel de dificultad debes de mostrarlo con un contador de dificultad desde el 1 hasta el 10, siendo el 10 la dificultad m\u00E1xima y el 1 la dificultad minima, \nque aparezca en cada elecci\u00F3n de manera aleatoria (recordar que el nivel de dificultad debe de ser coherente con la narrativa de la accion), \neste nivel de dificultad debe de ser mas probable que aparezca en un nivel alto a medida que aumentan las elecciones, ahora voy a mostrarte las estad\u00EDsticas del personaje, \ntiene 100 puntos de estad\u00EDstica en cada aspecto, 100 es la base, el punto intermedio, las acciones que le ocurran al personaje pueden modificar \npermanentemente estas estad\u00EDsticas o modificarlas temporalmente, las estad\u00EDsticas son, vida (100), fuerza: la cantidad de da\u00F1o que realiza el personaje (100), \nagilidad: la habilidad para acertar golpes, esquivar ataques, asestar cr\u00EDticos y moverse con mas libertad y velocidad (100) y la surte: \ncuanta mayor suerte mejores elecciones consigues, mejor suerte tienes en cada elecci\u00F3n \n(mas posibilidades de que salga beneficiosa) o que consigas mejores recompensas o mejoras de estad\u00EDsticas en cada elecci\u00F3n (100), \nen cada turno tienes que mostrarme las estad\u00EDsticas y como han variado dependiendo de la eleccion.";
var model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
var playerstats = {
    player_id: 1,
    descripcion: '',
    vida: 100,
    fuerza: 0,
    agilidad: 0,
    suerte: 0,
    alive: 0,
    run: 0,
};
var userpromt = '';
var chat = model.startChat({
    history: [],
});
app.get('/gemini', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, response, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Petici\u00F3n recibida al endpoint GET /gemini");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, chat.sendMessage(promtNarrativa)];
            case 2:
                result = _a.sent();
                return [4 /*yield*/, result.response];
            case 3:
                response = _a.sent();
                res.json(response.text());
                //Enviar el array antes de elegir las opciones
                console.log('Respuesta enviada al cliente: ' + JSON.stringify(response.text()));
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                console.error(err_1);
                res.status(500).send('Internal Server Error on the initial promt');
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get('/geminiresponse/:option', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, response, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Petici\u00F3n recibida al endpoint GET /geminiresponse/:option");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                userpromt = '';
                userpromt = req.params.option;
                console.log('Respuesta efectuada cargando promt...');
                return [4 /*yield*/, chat.sendMessage(userpromt)];
            case 2:
                result = _a.sent();
                return [4 /*yield*/, result.response];
            case 3:
                response = _a.sent();
                res.json(response.text());
                console.log(response.text);
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                console.error(err_2);
                res.status(500).send('Internal Server Error when answering prompt');
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get('/geminiresponse/:option');
var port = 3000;
app.listen(port, function () {
    return console.log("App listening on PORT " + port + ".\n\n    ENDPOINTS:\n    \n    -   /gemini\n    -   /geminiresponse\n     ");
});

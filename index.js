const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

async function enviarEmailBackend(
  nome,
  email,
  telefone,
  mensagem,
  propostaFile,
  propostaName
) {
  try {
    let transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: 'site@patense.com.br',
        pass: 'p!t@n#e0623',
      },
    });

    let attachments = [];
    if (propostaFile) {
      attachments.push({
        filename: propostaName,
        content: propostaFile.buffer,
      });
    }

    let info = await transporter.sendMail({
      from: 'site@patense.com.br',
      to: ["contas@bmouseproductions.com", "vendas@patense.com.br"], 
      subject: 'Gostaria de saber mais informações sobre as farinhas de Camarão e Atum',
      html: `<p>Nome: ${nome}</p>
             <p>Telefone: ${telefone}</p>
             <p>E-mail: ${email}</p>
             <p>Mensagem: ${mensagem}</p>`,
      attachments: attachments,
    });
    console.log('email send: %s', info.messageId);
  } catch (err) {
    console.error(err);
  }
}

app.post('/send', upload.single('propostaFile'), async (req, res) => {
  const { nome, email, telefone, mensagem, propostaName } = req.body;
  const propostaFile = req.file;

  try {
    await enviarEmailBackend(
      nome,
      email,
      telefone,
      mensagem,
      propostaFile,
      propostaFile ? propostaFile.originalname : ''
    );

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ msg: 'Email send success' });
  } catch (error) {
    console.error('Error sending the email', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Error sending the email' });
  }
});

app.listen(3001, function() {
  console.log('Servidor rodando na porta 3001');
});
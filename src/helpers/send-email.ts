import nodeMailer from 'nodemailer'

export default (nuevoLink: string, email: string) => {

    return new Promise<void>((resolve, reject) => {
        try {
            const transporter = nodeMailer.createTransport({
                host: 'smtp.elasticemail.com',
                port: 2525,
                auth: {
                    user: '4devteam.utn@gmail.com',
                    pass: 'D100A4CC8DD477EC6F17BF177463F4BBF514'
                }
            });

            const mailOptions = {
                from: '4devteam.utn@gmail.com',
                to: email,
                subject: "Verificación cuenta kineapp",
                html: `<a href=${nuevoLink}>Click aquí para verificar tu cuenta</a>` // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });

            resolve()

        } catch (error) {
            console.log(error)
            reject()
        }

    })


}


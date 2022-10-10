import nodeMailer from 'nodemailer'

export default (nuevoLink: string, email: string, subject: string, htmlText: string) => {

    return new Promise<void>((resolve, reject) => {
        try {
            const transporter = nodeMailer.createTransport({
                service: 'gmail',
                auth: {
                    user: '4devteam.utn@gmail.com',
                    pass: 'xoxkkbefzdrwinpy'
                }
            });

            const mailOptions = {
                from: '4devteam.utn@gmail.com',
                to: email,
                subject: subject,
                //html: `<a href=${nuevoLink}>${htmlText}</a>` // html body
                html: `<style>
                .email-content{
                  background-color: #FFF;
                  width: 100%;
                  height: 400px;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
              }
              .logo-kineapp{
                  width: 200px;
              }
              h1{
                  font-size: 24px;
                  color: #5b5b5b;
                  font-weight: 800;
                  margin-top: 40px;
              }
              a{
                  margin-top: 20px;
                  font-size: 14px;
                  text-decoration: none;
                  color: #0093b0;
              }
              a:hover{
                  cursor: pointer;
              }
              </style>
              <div class="email-content">
                <img src="http://api-kineapp.herokuapp.com/logo-kineapp-nombre.png" alt="" class="logo-kineapp">
                <h1>${subject}</h1>
                <a href="${nuevoLink}">${htmlText}</a>
              </div>`
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
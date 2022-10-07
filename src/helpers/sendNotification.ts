import webpush from "web-push"

export default async (pushSubscription: string) => {

    const vapidKeys = {
        publicKey: "BNGSmnHU5QmHZpNdJLg7bK-fe5-5N4HZBihIT7avN85GpbLFQMSDybAIgLLUPwpxYSWMqoUA7thc0xeE0Qi3O1g",
        privateKey: "zbw8MoGYNxyj4CZgpCLzAMrjYuJl3YkHe2v6Fwu2U5k"
    }

    webpush.setVapidDetails(
        'mailto:example@yourdomain.org',
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );

    const payload = {
        "notification": {
            "title": "kineapp Notification",
            "body": "",
            "vibrate": [100, 50, 100],
            "image": "http://api-kineapp.herokuapp.com/file-id-ejercicio-1.gif",
            /**"data": {
             * "dateOfArrival": Date.now(),
             * "primaryKey": 1
             * } */
            "actions": [{
                "action": "explore",
                "title": "Go to the site"
            }]
        }
    }

    webpush.sendNotification(
        JSON.parse(pushSubscription),
        JSON.stringify(payload))
        .then(res => {
            console.log('Enviado !!');
        }).catch(err => {
            console.log('Error', err);
        })

    return

}
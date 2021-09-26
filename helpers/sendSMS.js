const Vonage = require('@vonage/server-sdk');

const sendSMS = (phone, code) => {
    const vonage = new Vonage({
        apiKey: "574340d9",
        apiSecret: "Mis98czfRpYQ6r3F"
    });

    const text = `Verification code: ${code}`;
    const from = "My node project"
    const to = phone
    const opts = {
        "type": "unicode"
    }
        
    vonage.message.sendSms(from, to, text, opts, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if(responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
    });

}

module.exports = sendSMS;
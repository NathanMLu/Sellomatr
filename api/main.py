import hashlib
import os

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from flask import Flask, request, make_response, jsonify

app = Flask(__name__)


@app.route('/authenticate', methods=['GET', 'POST'])
def authenticate():
    # if it's a get request
    if request.method == 'GET':
        challenge_code = str(request.args.get('challenge_code'))

        # For local only
        # file = open("token.txt", mode="r")

        verification_token = str(os.environ['TOKEN'])
        endpoint = "https://sellomatr.herokuapp.com/authenticate"

        code = (challenge_code + verification_token + endpoint).encode("utf-8")

        m = hashlib.sha256(code)

        response = {
            "challengeResponse": m.hexdigest()
        }

        return make_response(jsonify(response), 200)
    elif request.method == 'POST':
        message = Mail(
            from_email=os.environ["EMAIL"],
            to_emails=os.environ["EMAIL"],
            subject='User Opting Out of Sellomatr',
            html_content=str(request.data))
        try:
            sg = SendGridAPIClient(os.environ['SENDGRID'])
            sg.send(message)
        except Exception as e:
            print(e)
        return make_response(jsonify({'success': True}), 200)


if __name__ == '__main__':
    app.run()

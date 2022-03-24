import hashlib
import os
import base64
import random
import string

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from flask import Flask, request, make_response, jsonify
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

app = Flask(__name__)
my_iv = ""
my_salt = ""


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
        print("User Opting Out!")
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


@app.route('/keys', methods=['POST', 'GET'])
def keys():
    global my_iv, my_salt

    def randStr(chars=string.ascii_uppercase + string.digits, size=16):
        return ''.join(random.choice(chars) for _ in range(size))

    def encrypt(data, key, encode_iv):
        data = pad(data.encode(), 16)
        cipher = AES.new(key.encode('utf-8'), AES.MODE_CBC, encode_iv)
        return base64.b64encode(cipher.encrypt(data))

    # TODO: Check request method for correct origin

    client_id = str(os.environ["CLIENTID"])
    client_secret = str(os.environ["CLIENTSECRET"])
    redirect_uri = str(os.environ["REDIRECTURI"])

    encrypt_key = randStr()
    encrypt_iv = randStr().encode("utf-8")

    my_iv = encrypt_iv
    my_salt = encrypt_key

    encrypted_client_id = encrypt(client_id, encrypt_key, encrypt_iv)
    encrypted_client_secret = encrypt(client_secret, encrypt_key, encrypt_iv)
    encrypted_redirect_uri = encrypt(redirect_uri, encrypt_key, encrypt_iv)

    return make_response(jsonify({
        "client_id": encrypted_client_id.decode("utf-8"),
        "client_secret": encrypted_client_secret.decode("utf-8"),
        "redirect_uri": encrypted_redirect_uri.decode("utf-8")
    }), 200)


@app.route('/iv', methods=['POST', 'GET'])
def iv():
    return my_iv


@app.route('/salt', methods=['POST', 'GET'])
def salt():
    return my_salt


if __name__ == '__main__':
    app.run()

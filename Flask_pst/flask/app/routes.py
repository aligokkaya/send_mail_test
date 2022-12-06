import mysql.connector
from flask import redirect,url_for,session,request,render_template,make_response,jsonify
from functools import wraps
from app import app
import requests
import time
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from flask_restful import Resource, Api
import json
from math import *
from postfinancecheckout import Configuration
from postfinancecheckout.api import TransactionServiceApi, TransactionPaymentPageServiceApi
from postfinancecheckout.models import LineItem, LineItemType, TransactionCreate
import hashlib
import hmac
import base64




def db_con():
    mydb = mysql.connector.connect(
    host="178.18.242.122",
    user="root",
    password="Challenge_t4",
    database="nxpdev1user_ir-dev")

    return mydb
app.secret_key='super secret key'



def db_insert():
    return 'ok'

def sign(secret, userId, method, path, timestamp,encoding='utf-8'):
    data = "1|" + str(userId) + "|"+str(timestamp)+"|" + method + "|" + path
    userId=data.encode(encoding)
    secret = base64.b64decode(secret.encode(encoding))
    digest = hmac.new(secret, userId,hashlib.sha512).digest()
    digest_b64 = base64.b64encode(digest)
    return digest_b64.decode(encoding).replace('\n', '')


# mac_id=(sign('anJaBQj49HoV2gKhKJBAYDUMF7uBw8/ZxJq04VhTw7I=', "31356", "POST", "/api/transaction/create?spaceId=31356", int(time.time())))




json_data={}
@app.route("/",methods=['GET','POST'])
def homepage():
    return render_template('index.html')


@app.route("/pst",methods=['GET','POST'])
def postfinance():
    
    if request.method=='POST':
        civilite=request.form        
        try:
            json_data['typedon']=civilite['caddie[type]']
            json_data['montant']=civilite['caddie[articles][0][montant]']
            json_data['total']=civilite['caddie[total]']
            json_data['id']=civilite['caddie[id]']

        except:
            dat=json.loads(civilite['donateur'])
            json_data['civilite']=dat['civilite']
            json_data['nom']=dat['nom']
            json_data['prenom']=dat['prenom']
            json_data['email']=dat['email']
            json_data['telephone']=dat['telephone']
            json_data['natel']=dat['natel']
            json_data['adress1']=dat['address1']
            json_data['adress2']=dat['address2']
            json_data['codepostal']=dat['codepostal']
            json_data['ville']=dat['ville']
            json_data['pays']=dat['pays']
            json_data['language']=dat['langue']
            json_data['brand']=dat['brand']
    print(json_data)
    space_id = 32531
    api_secret='ZLy8yKWhc737ySxMv1Pl4/YBD9zu5TxovkVp/qOOfUI='
    user_id=63008
    config = Configuration(
        user_id=user_id,
        api_secret=api_secret
    )
    gelen=(sign(api_secret, user_id, "GET", "/api/transaction/read?spaceId=12&id=1", time.time()))
    print(gelen)

    transaction_service = TransactionServiceApi(configuration=config)
    transaction_payment_page_service = TransactionPaymentPageServiceApi(configuration=config)

    # create line item
    line_item = LineItem(
        name='Red T-Shirt', 
        unique_id='5412',
        sku='red-t-shirt-123',
        quantity=1,
        amount_including_tax=61,
        type=LineItemType.PRODUCT
    )

    # create transaction model
    transaction = TransactionCreate(
        line_items=[line_item],
        auto_confirmation_enabled=True,
        currency='CHF',
    )
    url_api_bank='https://e-payment.postfinance.ch/ncol/Prod/orderstandard_utf8.asp'
    transaction_create = transaction_service.create(space_id=space_id, transaction=transaction)
    _ = transaction_payment_page_service.payment_page_url(space_id=space_id, id=transaction_create.id)
    # print('URL-----------',payment_page_url)
    html = '<form name="donsform" action="' +str(url_api_bank) + '" method="post" onload=""style="display:none;">'
    # html += '' if json_data['typedon'] == 0 else '<input type="hidden" name="ALIAS" value="' + alias + '">' : ''
    html += '<input type="hidden" name="AMOUNT" value="'+json_data['montant']+'><input type="hidden" name="BRAND" value="'+json_data['brand']+'"><input type="hidden" name="CANCELURL" value="'+str('http://192.168.0.101:8080/')+'"><input type="hidden" name="CN" value="'+json_data['nom']+'"><input type="hidden" name="CURRENCY" value="CHF"><input type="hidden" name="DECLINEURL" value="'+str('http://192.168.0.101:8080/')+'"><input type="hidden" name="EMAIL" value="'+json_data['email']+'"><input type="hidden" name="EXCEPTIONURL" value="'+str('http://192.168.0.101:8080/')+'"><input type="hidden" name="LANGUAGE" value="'+json_data['language']+'"><input type="hidden" name="ORDERID" value="'+json_data['id']+'"><input type="hidden" name="OWNERADDRESS" value="'+json_data['adress1']+'"><input type="hidden" name="OWNERCTY" value="'+json_data['ville']+'"><input type="hidden" name="OWNERZIP" value="'+json_data['codepostal']+'"><input type="hidden" name="PM" value="'+json_data['brand']+'"><input type="hidden" name="PSPID" value="XXX"><input type="hidden" name="SHASIGN" value="'+gelen+'"><input type="hidden" name="TP" value="TP">'
    html += '<input type="submit" value="" id=submit2 name=submit2></form> <script type="text/javascript">document.forms["donsform"].submit();</script>'
    return html


@app.route("/webhook",methods=['GET','POST'])
def webhook():
    return 'ok'
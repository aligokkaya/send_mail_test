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
from flask_cors import CORS
# from flask import Flask
# app = Flask(__name__)

@app.route("/",methods=['GET','POST'])
def homepage():
    return render_template('index.html')


@app.route("/pst",methods=['GET','POST'])
def postfinance():
    
        space_id = 32531
        config = Configuration(
            user_id=63008,
            api_secret='ZLy8yKWhc737ySxMv1Pl4/YBD9zu5TxovkVp/qOOfUI='
        )

        transaction_service = TransactionServiceApi(configuration=config)
        transaction_payment_page_service = TransactionPaymentPageServiceApi(configuration=config)

        # create line item
        line_item = LineItem(
            name='Red T-Shirt',
            unique_id='5412',
            sku='red-t-shirt-123',
            quantity=1,
            amount_including_tax=29.95,
            type=LineItemType.PRODUCT
        )

        # create transaction model
        transaction = TransactionCreate(
            line_items=[line_item],
            auto_confirmation_enabled=True,
            currency='EUR',
        )

        transaction_create = transaction_service.create(space_id=space_id, transaction=transaction)
        payment_page_url = transaction_payment_page_service.payment_page_url(space_id=space_id, id=transaction_create.id)
        print('URL-----------',payment_page_url)
        
        return redirect(payment_page_url,code=302)

import imaplib
import base64
import os
import email
from mailclassdata import EmailRead

email_user = 'ali.gokkaya@nextalp.com'
email_pass = 'uF@3b7v73'

imap = imaplib.IMAP4_SSL('amun.ch-dns.net', 993)
imap.login(email_user, email_pass)
imap.select("INBOX")

_, selected_mails = imap.search(None, '(FROM "info@nextalp.com")')
#_, selected_mails = imap.search(None, 'ALL')


def arraydata(array):
    email_data=[]
    for i in array:
        if len(i)>0:
            email_data.append(i)
    return email_data

print("Total Messages:" , len(selected_mails[0].split()))

for num in selected_mails[0].split():
    _, data = imap.fetch(num , '(RFC822)')
    _, bytes_data = data[0]
    email_message = email.message_from_bytes(bytes_data)
    # print("\n===========================================")
    # # print(email_message)
    # print("Subject: ",email_message["subject"])
    # print("To:", email_message["to"])
    # print("From: ",email_message["from"])
    # print("Date: ",email_message["date"])

    for part in email_message.walk():
        if part.get_content_type()=="text/plain" or part.get_content_type()=="text/html":
            message = part.get_payload(decode=True)
            # print("Message:",message.decode('latin-1'))
            # print("==========================================\n")
            
            if email_message["subject"].find('KoGu Transport')>=0:
                data=message.decode('latin-1').split("\r\n")
                email_data=arraydata(data)
                data=EmailRead(email_data)
                print(data.KoGu())
            if email_message["subject"].find('Medicall')>=0:
                data=message.decode('latin-1').split("\r\n")
                email_data=arraydata(data)
                data=EmailRead(email_data)
                data.Medicall()
            if email_message["subject"].find('DLC')>=0:
                data=message.decode('latin-1').split("\r\n")
                email_data=arraydata(data)
                data=EmailRead(email_data)
                data.DLC()
            if email_message["subject"].find('Mobi24')>=0:
                data=message.decode('latin-1').split("\r\n")
                email_data=arraydata(data)
                data=EmailRead(email_data)
                data.Mobi24()
            if email_message["subject"].find('Zurih')>=0:
                data=message.decode('latin-1').split("\r\n")
                email_data=arraydata(data)
                data=EmailRead(email_data)
                data.Zurih()
            if email_message["subject"].find('AXA')>=0:
                data=message.decode('latin-1').split("\r\n")
                email_data=arraydata(data)
                data=EmailRead(email_data)
                data.AXA()
            if email_message["subject"].find('Technostore')>=0:
                data=message.decode('latin-1').split("\r\n")
                email_data=arraydata(data)
                data=EmailRead(email_data)
                data.Technostore()
            break
#
#https://medium.com/@sdoshi579/to-read-emails-and-download-attachments-in-python-6d7d6b60269
import imaplib
import base64
import os
import email

def mailread():
    email_user = 'ali.gokkaya@nextalp.com'
    email_pass = 'uF@3b7v73'

    imap = imaplib.IMAP4_SSL('imap.nextalp.com', 993)
    imap.login(email_user, email_pass)
    imap.select("INBOX")

    _, selected_mails = imap.search(None, '(FROM "info@nextalp.com")')
    #_, selected_mails = imap.search(None, 'ALL')
    for num in selected_mails[0].split():
        _, data = imap.fetch(num , '(RFC822)')
        _, bytes_data = data[0]
        email_message = email.message_from_bytes(bytes_data)
        for part in email_message.walk():
            if part.get_content_type()=="text/plain" and part.get_content_type()=="text/html":
                message = part.get_payload(decode=True)
                # print("Message:",message.decode('latin-1'))
                # print("==========================================\n")
                data=message.decode('latin-1').split("\r\n")
    return data
    
class SourceData:
    def __init__(self):
        data=mailread()
        self.data=data
        # self.email_pas=email_pass
        
       

class KoGu(SourceData):
    # global message
    # def __init__(self):
    #     message = EmailRead.__init_(self)
        # return 'message'
    def getName(self):
        
        print(self.data)
        # json_data={}
        # json_data['tel']=self.data[8]
        # json_data['sub']=self.data[0]
        # json_data['obj']=self.data[4]
        # json_data['date']=self.data[6]
        # return json_data
class Medicall(SourceData):
    def getName():
        return 'ok'

class DLC(SourceData):
        # json_data={}
        # json_data['sub']=self.data[0]
        # json_data['obj']=self.data[4]
        # return json_data
    def getName():
        return 'ok'
class Mobi24(SourceData):
    def getName():
        return 'ok'
class Zurih(SourceData):
    def getName():
        return 'ok'
class AXA(SourceData):
    def getName():
        return 'ok'
class Technostore(SourceData):
    def getName():
        return 'ok'


# mule = KoGu() 
print(mailread())

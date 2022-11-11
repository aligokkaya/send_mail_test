import email
import imaplib
from pdfminer3.layout import LAParams
from pdfminer3.pdfpage import PDFPage
from pdfminer3.pdfinterp import PDFResourceManager
from pdfminer3.pdfinterp import PDFPageInterpreter
from pdfminer3.converter import TextConverter
import io


def Message(data):
    json_data={}
    arr=[]
    for i in range(len(data)):
            try:
                if len(data[i])!=0:
                    arr.append(data[i])
            except:
                pass
    json_data['message']=arr
    return json_data['message']
class ReadPDF():
    
    def __init__(self,file):
        self.file=file
        self.text=''
        self.resource_manager = PDFResourceManager()
        self.fake_file_handle = io.StringIO()
        self.converter = TextConverter(self.resource_manager, self.fake_file_handle, laparams=LAParams())
        self.page_interpreter = PDFPageInterpreter(self.resource_manager, self.converter)
        with open(self.file, 'rb') as fh:
            for page in PDFPage.get_pages(fh,
                                        caching=True,
                                        check_extractable=True):
                self.page_interpreter.process_page(page)

            self.text = self.fake_file_handle.getvalue()
        self.converter.close()
        self.fake_file_handle.close()

    def getTel(self):
        # self.text.split('n/r')
        # if self.text.find('Tél bureau:'):

        # print(self.text)
        return self.text
    def getText(self):
        return self.text       
class RequestManager():
    def __init__(self,tip,user ='ali.gokkaya@nextalp.com',email_pass = 'uF@3b7v73'):
        self.user=user
        self.email_pass=email_pass
        self.tip=tip
        self.mail = imaplib.IMAP4_SSL('imap.nextalp.com',993)
        self.mail.login(self.user, self.email_pass)
        _, self.messages = self.mail.select('INBOX')
        # _, self.selected_mails = self.mail.search(None, '(FROM "info@nextalp.com")')
        _, self.selected_mails = self.mail.search(None, 'ALL')
        self.messages = int(self.messages[0])
        self.readEmailContent()
    def readEmailContent(self):
        for i in self.selected_mails[0].split():
            _, msg = self.mail.fetch(i, "(RFC822)")
            for response in msg:
                if isinstance(response, tuple):
                    msg = email.message_from_bytes(response[1])
                    self.subject = msg["Subject"]
                    if self.subject.find(self.tip)>=0:
                        self.sender = msg["From"]
                        self.body = ""
                        temp = msg
                        if temp.is_multipart():
                            for part in temp.walk():
                                ctype = part.get_content_type()
                                cdispo = str(part.get('Content-Disposition'))
                                if ctype == 'text/plain' and 'attachment' not in cdispo:
                                    self.body = part.get_payload(decode=True)  # decode
                                    break
                        else:
                            self.body = temp.get_payload(decode=True)
    
class AXA(RequestManager):
    def __init__(self) -> None:
        super().__init__(tip='AXA')

    
    def getMessage(self):
        self.data=self.body.decode('latin-1').split('\r\n')
        json_data=Message(self.data)    
        return json_data

    def getName(self):
        json_data={}
        self.data=self.body.decode('latin-1').split('\r\n')
        data=Message(self.data)
        # print(data)
        for i in range(len(data)):
            if data[i].find('prénom')>=0:
                json_data['prenom']=str(data[i])[40:]
            if data[i].find(' nom ')>=0:
                json_data['nom']=str(data[i])[40:]
        # print(data)
        return json_data
    def getSubject(self):
        return self.sender

    def getAdress(self):
        json_data={}
        self.data=self.body.decode('latin-1').split('\r\n')
        data=Message(self.data)
        # print(data)
        for i in range(len(data)):
            if data[i].find('lieu')>=0:
                json_data['lieu']=str(data[i])[40:]
            if data[i].find('adresse')>=0:
                json_data['adresse']=str(data[i])[40:]
            if data[i].find('pays')>=0:
                json_data['pays']=str(data[i])[40:]
            if data[i].find('localité de panne')>=0:
                json_data['localite de panne']=str(data[i])[40:]
        return json_data

    def getTel(self):
        json_data={}
        self.data=self.body.decode('latin-1').split('\r\n')
        data=Message(self.data)
        # print(data)
        for i in range(len(data)):
            if data[i].find('téléphone')>=0:
                json_data['tel']=str(data[i])[40:]
        return json_data

    def getOrdre(self):
        json_data={}
        self.data=self.body.decode('latin-1').split('\r\n')
        data=Message(self.data)
        # print(data)
        for i in range(len(data)):
            if data[i].find('assureur')>=0:
                json_data['assureur']=str(data[i])[40:]
            if data[i].find('  mandant ')>=0:
                json_data['mandant']=str(data[i])[32:]
            if data[i].find('numéro de dossie')>=0:
                json_data['numero_de_dossie']=str(data[i])[40:]
            if data[i].find('numéro dordre')>=0:
                json_data['numero_dordre']=str(data[i])[40:]
            if data[i].find('type dordre')>=0:
                json_data['type_dordre']=str(data[i])[40:]
            if data[i].find('   couverture')>=0:
                json_data['couverture']=str(data[i])[40:]
            if data[i].find('partenaire')>=0:
                json_data['partenaire']=str(data[i])[40:]
            if data[i].find('montant de facturation')>=0:
                json_data['montant_de_facturation']=str(data[i])[40:]

        return json_data

class KoGu_Transport(RequestManager):
    def __init__(self) -> None:
        super().__init__(tip='KoGu Transport')
    
    def getData(self):
        json_data={}
        self.data=self.body.decode('latin-1').split('\r\n')
        data=Message(self.data)
        # print(data)
        for i in range(len(data)):
            if data[i]=='Personne responsable':
                json_data['Personne responsable']=data[i+1]
            if data[i]=='Téléphone':
                json_data['Tel']=data[i+1]
            if data[i]=='Votre téléphone':
                json_data['Votre_Tel']=data[i+1]
            if data[i]=='Somme':
                json_data['Somme']=data[i+1]

        return json_data

    def getMessage(self):
        data=self.body.decode('latin-1').split('\r\n')
        json_data=Message(data)    
        return json_data
    def getName(self):
        return self.subject
    def getSubject(self):
        return self.sender


class KoGu_Pannen(RequestManager):
    def __init__(self) -> None:
        super().__init__(tip='KoGu Pannendienst')
    
    def getData(self):
        json_data={}
        self.data=self.body.decode('latin-1').split('\r\n')
        data=Message(self.data)
        # print(data)
        for i in range(len(data)):
            if data[i]=='Personne responsable':
                json_data['Personne responsable']=data[i+1]
            if data[i]=='Téléphone':
                json_data['Tel']=data[i+1]
            if data[i]=='Votre téléphone':
                json_data['Votre_Tel']=data[i+1]
            if data[i]=='Somme':
                json_data['Somme']=data[i+1]

        return json_data

    def getMessage(self):
        data=self.body.decode('latin-1').split('\r\n')
        json_data=Message(data)    
        return json_data
    def getName(self):
        return self.subject
    def getSubject(self):
        return self.sender
class DLC(RequestManager,ReadPDF):
    def __init__(self) -> None:
        super().__init__(tip='DLC')
        ReadPDF.__init__(self,file='1084280.pdf')
    def getMessage(self):
        data=self.body.decode('latin-1').split('\r\n')
        json_data=Message(data)    
        return json_data
    def getName(self):
        return self.subject
    def getSubject(self):
        return self.sender

class Medical(RequestManager):
    def __init__(self) -> None:
        super().__init__(tip='Medical')
        
    def getData(self):
        json_data={}
        self.data=self.body.decode('latin-1').split('\r\n')
        data=Message(self.data)
        # print(data)
        for i in range(len(data)):
            if data[i]=='Personne responsable':
                json_data['Personne responsable']=data[i+1]
            if data[i]=='Téléphone':
                json_data['Tel']=data[i+1]
            if data[i]=='Votre téléphone':
                json_data['Votre_Tel']=data[i+1]
            if data[i]=='Somme':
                json_data['Somme']=data[i+1]

        return json_data
    def getMessage(self):
        data=self.body.decode('latin-1').split('\r\n')
        json_data=Message(data)    
        return json_data
    def getName(self):
        return self.subject
    def getSubject(self):
        return self.sender

class Mobi24(RequestManager):
    def __init__(self) -> None:
        
        super().__init__(tip='Mobi24')
        
    def getMessage(self):
        data=self.body.decode('latin-1').split('\r\n')
        json_data=Message(data)    
        return json_data
    def getName(self):
        return self.subject
    def mesaj(self):
        json_data={}
        self.data=self.body.decode('latin-1').split('\r\n')
        data=Message(self.data)
        # print(data)
        for i in range(len(data)):
            if data[i].find('Interlocuteur:')>=0:
                print(data[i])
                json_data['Interlocuteur']=str(data[i])[14:]
        return json_data
    def getSubject(self):
        return self.sender

class Zurih(RequestManager):
    def __init__(self) -> None:
        
        super().__init__(tip='Zurich')
        
    def getMessage(self):
        data=self.body.decode('latin-1').split('\r\n')
        json_data=Message(data)    
        return json_data
    def getName(self):
        return self.subject
    def getData(self):
        json_data={}
        self.data=self.body.decode('latin-1').split('\r\n')
        data=Message(self.data)
        for i in range(len(data)):
            if data[i].find('Personne de contact:')>=0:
                json_data['Personne de contact']=str(data[i])[23:]
            if data[i].find('CHF')>=0:
                print(data[i])
                json_data['CHF']=str(data[i])[120:129]
        return json_data
    def getSubject(self):
        return self.sender


read= KoGu_Pannen()
print(read.getData())


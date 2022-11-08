import email
import imaplib
from pdfminer3.layout import LAParams
from pdfminer3.pdfpage import PDFPage
from pdfminer3.pdfinterp import PDFResourceManager
from pdfminer3.pdfinterp import PDFPageInterpreter
from pdfminer3.converter import TextConverter
import io


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
    body=''

    def __init__(self,tip,user = 'ali.gokkaya@nextalp.com',email_pass = 'uF@3b7v73'):
        self.user=user
        self.email_pass=email_pass
        self.tip=tip
        self.mail = imaplib.IMAP4_SSL('imap.nextalp.com',993)
        self.mail.login(self.user, self.email_pass)
        _, self.messages = self.mail.select('INBOX')
        # _, self.selected_mails = self.mail.search(None, '(FROM "info@nextalp.com")')
        _, self.selected_mails = self.mail.search(None, 'ALL')
        self.messages = int(self.messages[0])
        
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
        return self.body.decode('latin-1')
    def getName(self):
        return self.subject
    def getSubject(self):
        return self.sender

class KoGu(RequestManager):
    def __init__(self) -> None:
        
        super().__init__(tip='KoGu')
        
    def getMessage(self):
        json_data={}

        return self.body.decode('latin-1')
    def getName(self):
        return self.subject
    def getSubject(self):
        return self.sender

class DLC(RequestManager,ReadPDF):
    def __init__(self) -> None:
        super().__init__(tip='DLC')
        ReadPDF.__init__(self,file='1084280.pdf')
    def getMessage(self):
        return self.body.decode('latin-1')
    def getName(self):
        return self.subject
    def getSubject(self):
        return self.sender

class Medical(RequestManager):
    def __init__(self) -> None:
        super().__init__(tip='Medical')
        
    def getMessage(self):
        return self.body.decode('latin-1')
    def getName(self):
        return self.subject
    def getSubject(self):
        return self.sender

class Mobi24(RequestManager):
    def __init__(self) -> None:
        
        super().__init__(tip='Mobi24')
        
    def getMessage(self):
        return self.body.decode('latin-1')
    def getName(self):
        return self.subject
    def getSubject(self):
        return self.sender

class Zurih(RequestManager):
    def __init__(self) -> None:
        
        super().__init__(tip='Zurih')
        
    def getMessage(self):
        return self.body.decode('latin-1')
    def getName(self):
        return self.subject
    def getSubject(self):
        return self.sender


read= DLC()
read.getTel()





  
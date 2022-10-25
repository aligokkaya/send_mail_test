import imaplib
import base64
import os
import email


email_user = 'ali.gokkaya@nextalp.com'
email_pass = 'uF@3b7v73'

imap = imaplib.IMAP4_SSL('amun.ch-dns.net', 993)
imap.login(email_user, email_pass)
imap.select("INBOX")

#_, selected_mails = imap.search(None, '(FROM "info@nextalp.com")')
_, selected_mails = imap.search(None, 'ALL')

print("Total Messages:" , len(selected_mails[0].split()))

for num in selected_mails[0].split():
    _, data = imap.fetch(num , '(RFC822)')
    _, bytes_data = data[0]
    email_message = email.message_from_bytes(bytes_data)
    print("\n===========================================")
    print("Subject: ",email_message["subject"])
    print("To:", email_message["to"])
    print("From: ",email_message["from"])
    print("Date: ",email_message["date"])
    for part in email_message.walk():
        if part.get_content_maintype()=="text/plain" or part.get_content_maintype=="multipart":
            message = part.get_payload(decode=True)
            print("Message:",message.decode('latin-1'))
            print("==========================================\n")
            fileName = part.get_filename()
            print(fileName)
            if bool(fileName):
                filePath = os.path.join('/Users/aa/Desktop/yavuz_bey', fileName)
                if not os.path.isfile(filePath) :
                    fp = open(filePath, 'wb')
                    fp.write(part.get_payload(decode=True))
                    fp.close()
                subject = str(email_message).split("Subject: ", 1)[1].split("\nTo:", 1)[0]
                # print('Downloaded "{file}" from email titled "{subject}" with UID {uid}.'.format(file=fileName, subject=subject, uid=latest_email_uid.decode('utf-8')))
            break
#
#https://medium.com/@sdoshi579/to-read-emails-and-download-attachments-in-python-6d7d6b60269

class EmailRead:
    json_data={}
    def __init__(self,data):
        self.data=data

        # print(self.data)
    def KoGu(self):
        # print(self.data)
        json_data={}
        # for i in self.data:
        json_data['tel']=self.data[8]
        json_data['sub']=self.data[0]
        json_data['obj']=self.data[4]
        json_data['date']=self.data[6]
            # if i.find('Date:')>=0:
            #     print(i)
            # if i.find('Personne responsable')>=0:
            #     print(i)
        return json_data
    def Medicall(self):
        return self.data
    def DLC(self):
        return self.data
    def Mobi24(self):
        return self.data
    def Zurih(self):
        return self.data
    def AXA(self):
        return self.data
    def Technostore(self):
        return self.data
import CapTipper
import sys
import CTCore
import re
import pprint
import json
import csv
import zlib


from CTCore import show_hosts
from CTCore import all_conversations
from CTCore import hosts
from CTCore import client

from CTConsole import console
from collections import defaultdict



#To extract the referer,host & uri#
def info():
	f= open('details.txt', 'w')
	sys.stdout= f
	for i in range(len(all_conversations)):
		print "INFO[{}]= ".format(i), "(URI)-->".format(i),all_conversations[i].uri ,"\n          (REFERER)-->".format(i), all_conversations[i].referer,"\n          (HOST)-->".format(i),all_conversations[i].host, "\n"
	f.close()


#Information of Request#
def req_head():
	fn= open('reqhead.txt', 'w')
	sys.stdout= fn
	for i in range(len(all_conversations)):
		print "Req_Head[{}]=".format(i),all_conversations[i].req_head
	fn.close() 

#Information of Response#
def resp_head():
	fi= open('resphead.txt', 'w')
	sys.stdout= fi
	for i in range(len(all_conversations)):
		if len(all_conversations[i].res_head)!= 0:
			print "Res_Head[{}]=".format(i), all_conversations[i].res_head
		else:
			 print "Res_Head[{}]=".format(i), "\n", "Date: No date available"
	fi.close()

#Information of response body#
def resp_body():
	fr= open('respbody.txt','w')
	sys.stdout= fr
	for i in range(len(all_conversations)):
		try:
			print "Res_Body[{}]=".format(i),zlib.decompress(all_conversations[i].res_body, zlib.MAX_WBITS+16)	
		except:
			print all_conversations[i].res_body		 
	fr.close()

#To search URL in decompressed response body#
def search_url():
	fs= open('respbody.txt','r')
	jsonfile= open('graph.json',"r")
	jsonr= json.load(jsonfile)
		
	csvfile= open('url.csv','w')
	fieldnames= ['newid','source','target']
	writer= csv.DictWriter(csvfile, fieldnames= fieldnames)
	writer.writeheader()
	
	idx_start = 0
	idx_end = 0
	lines = fs.readlines()
	i = 0
	res_body_ctr = 0
	ctr=0

	while i < len(lines):
		idx_start = i
		idx_end = idx_start + 1
		while idx_end < len(lines) and not 'Res_Body' in lines[idx_end]:
			idx_end += 1

		for i in range(idx_start, idx_end):
			matchedurl = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', lines[i])
			for data in matchedurl:
				ctr+=1				
				writer.writerow({'newid': ctr,'source':res_body_ctr,'target': data})

		res_body_ctr += 1
		i = idx_end

		
#To decompress the response body#
import traceback
def decompress_body():
	my_file= open('respbody.txt','rb')#.read()		
	f = open('decoded.txt', 'wb')

	for line in my_file.readlines():
		textdecoded = ''
		try:
			textdecoded = zlib.decompress(line, zlib.MAX_WBITS+16)	
		except:
			f.write('ERROR ON DECOMPRESSION: ' + line +'\n')
			f.write(traceback.format_exc())

	f.write(textdecoded)
	f.close()
				
#To display the traffic flow#
def hosts():
	fl= open('hosts.txt', 'w')
	sys.stdout= fl
	show_hosts()
	#Information of Client#
	c= console()
	obj= c.do_client(client)
	fl.close()

#dictionary for request/response header info for each id#
def HeaderDict():
	dict_1 = defaultdict(list)
	dict_2= defaultdict(list)
	
	#sys.stdout= open('test.txt', 'w')

	with open('reqhead.txt', 'r') as f:
		lines = f.readlines()	
	with open('resphead.txt','r') as fl:
		texts= fl.readlines()

	for line in lines:
		match= re.search("^Req_Head(.*)", line, re.U)
		if  match:
			id = int((re.findall(r'\d+',line))[0])
		else:	
			dict_1[id].append(line.strip('\n'))

	for text in texts:
		match1= re.search("^Res_Head(.*)", text, re.U)
		if match1:
			id = int((re.findall(r'\d+',text))[0])
		else:
			dict_2[id].append(text.strip('\n'))


	for keys,values in dict_1.items():
		info1_dict= {}
		reqsthdr_dict= {}
		host_dict= []
		uri_dict= []
		src= []
		dest=[]

		info1_dict["id"]= keys
		host_dict.append(" http://" + all_conversations[keys].host+"/")
		uri_dict.append(" http://" + all_conversations[keys].host+ all_conversations[keys].uri)
		info1_dict["host"]= host_dict[0]
		info1_dict["uri"]= uri_dict[0]
		info1_dict["sources"]= src
		info1_dict["destinations"]= dest		
		
		for i in range(len(values)):
			parts= values[i].split(":")
			reqsthdr_dict[parts[0]]= ":".join(parts[1:])
			if not reqsthdr_dict.has_key("Referer"):
				reqsthdr_dict.setdefault("Referer", None)
			info1_dict["req_header"]= reqsthdr_dict				
		
		dict_1[keys]=  info1_dict

	for k,v in dict_2.items():
		info2_dict= {}
		resp_dict= {}
	
		for j in range(len(v)):
			p= v[j].split(":")
			resp_dict[p[0]]= ":".join(p[1:])
			info2_dict["resp_header"]= resp_dict		

		dict_2[k]= info2_dict
		

	#To merge 2 dictionary#
	def merged_dlist(d1,d2):
		merged_dict= defaultdict(list)
		merged_dict = merge_type(d1, merged_dict)
		merged_dict = merge_type(d2, merged_dict)
		return merged_dict

	def merge_type(dictionary, merged_dict):
		for key, value in dictionary.items():
			if isinstance(value, dict):
				merged_dict[key].append(value)			
		return merged_dict

	a= merged_dlist(dict_1,dict_2)

	#To get the linking between the ids'#
	for num in a:
		host= a[num][0]["host"]
		for nxt_num in a:
			ref= a[nxt_num][0]['req_header']['Referer']
			if host == ref:
				a[num][0]["destinations"].append(a[nxt_num][0]["id"])
				a[nxt_num][0]["sources"].append(a[num][0]["id"])

			
	#To get the output in JSON format#
	with open("graph.json","w") as out_file:	
		json.dump(a.values(), out_file, indent= 4)






def main():
	CapTipper.main(sys.argv)
	info()
	req_head()
	resp_head()
	resp_body()	
	HeaderDict()
	search_url()
	hosts()
	
	
	
	

if __name__ == "__main__":
	main()

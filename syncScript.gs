function syncHistoricalOrderTypes() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const orderSheet = ss.getSheetByName("data_order");
  if (!orderSheet) {
    SpreadsheetApp.getUi().alert("Không tìm thấy data_order");
    return;
  }
  
  const mapping = {
  "0002/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0003/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0004/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0005/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0006/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0007/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0008/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0009/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0010/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0011/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0012/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0013/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0014/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0015/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0016/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0017/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0018/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0019/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0020/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0021/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0022/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0023/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0024/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0025/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0026/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0027/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0028/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0029/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0030/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0031/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0032/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0033/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0034/2026/PLMR-AN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0035/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0036/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0037/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0038/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0039/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0040/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0041/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0042/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0043/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0044/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0045/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0046/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0047/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0048/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0049/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0050/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0051/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0052/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0053/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0054/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0055/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0056/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0057/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0058/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0059/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0060/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0061/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0062/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0063/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0064/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0065/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0066/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0067/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0068/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0069/2026/PLMR-AN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0070/2026/PLMR-TT": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0071/2026/PLMR-TT": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0072/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0073/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0074/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0075/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "CHỦ LỰC"
  },
  "0076/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0077/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0078/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0079/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0080/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0081/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0082/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0083/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0084/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0085/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0086/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0087/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0088/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0089/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0090/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0091/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0092/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0093/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0094/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0095/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0096/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0097/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0098/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0099/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0100/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0101/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0102/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0103/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0104/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0105/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0106/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0107/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0108/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0109/2026/PLMR-LC": {
    "type": "NEW IN",
    "tier": "CHỦ LỰC"
  },
  "0110/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0111/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0112/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0113/2026/PLMR-GLX": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0114/2026/PLMR-GLX": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0115/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0116/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0117/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0118/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0119/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0120/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0121/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "NEWIN"
  },
  "0122/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0123/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0124/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0125/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0126/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0127/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0128/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "NEWIN"
  },
  "0129/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0130/2026/PLMR-AT": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0131/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0132/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0133/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0134/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0135/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0136/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0137/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0138/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0139/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0140/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0141/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0142/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0143/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0144/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0145/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0146/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0147/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0148/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0149/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0150/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0151/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0152/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0153/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0154/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0155/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0156/2026/PLMR-GLX": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0157/2026/PLMR-GLX": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0158/2026/PLMR-GLX": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0159/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0160/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0161/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0162/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0163/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0164/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0165/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0166/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0167/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0168/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0169/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0170/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0171/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0172/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0173/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0174/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0175/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0176/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0177/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0178/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0179/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0180/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0181/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0182/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0183/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0184/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0185/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0186/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0187/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0188/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0189/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0190/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0191/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0192/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0193/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0194/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0195/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0196/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0197/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0198/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0199/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0200/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0201/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0202/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0203/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0204/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0205/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0206/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0207/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0208/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0209/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0210/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0211/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0212/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0213/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0214/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0215/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0216/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0217/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0218/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0219/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0220/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0221/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0222/2026/PLMR-LC": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0223/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0224/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0225/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0226/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0227/2026/PLMR-LC": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0228/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0229/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0230/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0231/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0232/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0233/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0234/2026/PLMR-GLX": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0235/2026/PLMR-GLX": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0236/2026/PLMR-GLX": {
    "type": "NEW IN",
    "tier": "NEWIN"
  },
  "0237/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0238/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0239/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0240/2026/PLMR-AT": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0241/2026/PLMR-HN KNIT": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0242/2026/PLMR-HN KNIT": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0243/2026/PLMR-HN KNIT": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0244/2026/PLMR-HN KNIT": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0245/2026/PLMR-HN KNIT": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0246/2026/PLMR-HN KNIT": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0247/2026/PLMR-HN KNIT": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0248/2026/PLMR-HN KNIT": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0249/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0250/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "PHỄU"
  },
  "0251/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0252/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0253/2026/PLMR-TLN": {
    "type": "RESTOCK",
    "tier": "CHỦ LỰC"
  },
  "0254/2026/PLMR-WS": {
    "type": "NEW IN",
    "tier": "PHỄU"
  },
  "0255/2026/PLMR-WS": {
    "type": "NEW IN",
    "tier": "PHỄU"
  },
  "0256/2026/PLMR-WS": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0257/2026/PLMR-WS": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0258/2026/PLMR-WS": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0259/2026/PLMR-WS": {
    "type": "RESTOCK",
    "tier": "PHỄU"
  },
  "0260/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "DUY TRÌ"
  },
  "0261/2026/PLMR-TLN": {
    "type": "NEW IN",
    "tier": "DUY TRÌ"
  },
  "0262/2026/PLMR-KP": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0263/2026/PLMR-KP": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0264/2026/PLMR-KP": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0265/2026/PLMR-KP": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0266/2026/PLMR-KP": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0267/2026/PLMR-KP": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0268/2026/PLMR-KP": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0269/2026/PLMR-KP": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0270/2026/PLMR-VH": {
    "type": "NEW IN",
    "tier": "DUY TRÌ"
  },
  "0271/2026/PLMR-VH": {
    "type": "NEW IN",
    "tier": "DUY TRÌ"
  },
  "0272/2026/PLMR-VH": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0273/2026/PLMR-VH": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0274/2026/PLMR-VH": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0275/2026/PLMR-VH": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0276/2026/PLMR-VH": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  },
  "0277/2026/PLMR-VH": {
    "type": "RESTOCK",
    "tier": "DUY TRÌ"
  }
};
  
  const data = orderSheet.getDataRange().getValues();
  if (data.length <= 1) return;

  // Kiểm tra xem dữ liệu có bị lệch cột không (do thêm 2 cột Phân Loại ĐH, Phân Cấp SP vào giữa)
  // Cột M (index 12) trước đây là "Trạng thái Vải", thường có giá trị "Pending", "Cancel", v.v.
  let needsShift = false;
  for (let i = 1; i < Math.min(10, data.length); i++) {
    const sample = String(data[i][12] || "").toLowerCase().trim();
    if (sample === "pending" || sample === "cancel" || sample === "hoàn thành" || sample === "chờ duyệt" || sample.includes("dệt")) {
      needsShift = true;
      break;
    }
  }

  if (needsShift) {
    // Dịch toàn bộ dữ liệu từ cột M -> X sang phải 2 cột (thành O -> Z) cho tất cả các dòng dữ liệu
    const numRows = orderSheet.getLastRow() - 1;
    const oldDataRange = orderSheet.getRange(2, 13, numRows, 14); // Lấy dư ra chút
    const oldData = oldDataRange.getValues();
    oldDataRange.clearContent();
    orderSheet.getRange(2, 15, numRows, 14).setValues(oldData);
  }

  // Cập nhật lại Headers cho chuẩn
  const ORDER_HEADERS = ["Thời gian lưu", "Mã đơn hàng", "Ngày đặt hàng", "Người tạo", "Công ty", "Nhà cung cấp", "Địa chỉ NCC", "Thuế VAT (%)", "Tổng tạm tính", "Tiền VAT", "Tổng cộng", "PO Tháng", "Phân Loại ĐH", "Phân Cấp SP", "Trạng thái Vải", "Hạn Duyệt (D+18)", "Hạn Cắt Vải (D+21)", "Hạn Lên Chuyền (D+22)", "Hạn Hoàn Thành (D+27)", "Trạng thái Bo", "Trạng thái NPL", "Ngày Đồng Bộ", "Ghi Chú", "Tổng SL", "Danh sách SP", "Danh sách Màu"];
  orderSheet.getRange(1, 1, 1, ORDER_HEADERS.length).setValues([ORDER_HEADERS]);
  orderSheet.getRange(1, 1, 1, ORDER_HEADERS.length).setFontWeight("bold").setBackground("#d0e0e3");

  const newData = orderSheet.getDataRange().getValues();
  const typesCol = [];
  const tiersCol = [];
  let updated = 0;
  
  for (let i = 1; i < newData.length; i++) {
    const orderNo = String(newData[i][1]).trim();
    const currentType = String(newData[i][12] || "").trim();
    const currentTier = String(newData[i][13] || "").trim();
    
    let nextType = currentType;
    let nextTier = currentTier;
    let needsUpdate = false;

    if (mapping[orderNo]) {
      if (currentType === "" || currentType !== mapping[orderNo].type) {
        nextType = mapping[orderNo].type;
        needsUpdate = true;
      }
      if (currentTier === "" || currentTier !== mapping[orderNo].tier) {
        nextTier = mapping[orderNo].tier;
        needsUpdate = true;
      }
    }
    
    typesCol.push([nextType]);
    tiersCol.push([nextTier]);
    
    if (needsUpdate) updated++;
  }
  
  if (typesCol.length > 0) {
    orderSheet.getRange(2, 13, typesCol.length, 1).setValues(typesCol);
    orderSheet.getRange(2, 14, tiersCol.length, 1).setValues(tiersCol);
  }
  
  SpreadsheetApp.getUi().alert("Đã tự động sửa lỗi lệch cột và đồng bộ thành công " + updated + " đơn hàng cũ!");
}

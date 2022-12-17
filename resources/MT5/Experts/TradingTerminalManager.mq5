//+------------------------------------------------------------------+
//|                                       TradingTerminalManager.mq5 |
//|                                  Copyright 2022, MetaQuotes Ltd. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2022, MetaQuotes Ltd."
#property link      "https://www.mql5.com"
#property version   "1.00"
#include <Trade\TerminalInfo.mqh>

input int updateSeconds = 15; // Updates every X seconds

CTerminalInfo *terminalInfo;

int OnInit()
{   
   terminalInfo = new CTerminalInfo();
   SetStatus("Started");
   UpdateStatus();
   EventSetTimer(updateSeconds);
   return(INIT_SUCCEEDED);
}

void SetStatus(string status){
   FileDelete("TradingTerminalManagerData/status.txt");
   int handle = FileOpen("TradingTerminalManagerData/status.txt", FILE_SHARE_READ|FILE_SHARE_WRITE|FILE_READ|FILE_WRITE|FILE_TXT);
   if(handle == -1){
      Print("Couldn't open file");
      return;
   }
   FileWriteString(handle, status);
   FileClose(handle);
}

void UpdateStatus(){
   if(terminalInfo.IsConnected()){
      SetStatus("Connected");
   } else {
      SetStatus("Disconnected");
   }
}

void OnTimer(){
   UpdateStatus();
}

void OnDeinit(const int reason){
   delete terminalInfo;
}
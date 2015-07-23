var tokenGlobal = "";
var companyWebADDR = "http://www.ec-solutions.com.hk";
var getMessagesPath = "http://anytours.chuyan.hk/push/message.php";
var subscribePath = "http://anytours.chuyan.hk/push/subscribe.php";
var syncMessagePath = "http://anytours.chuyan.hk/push/syncMessage.php";
var GCMId = "862098836172";
var appName = "AnyTours";
var development = "sandbox";
var welcomeMessage = {
  alert:"Welcome to AnyTours APP 歡迎使用天陽旅遊 APP",
  message_id: "-1",
  //deliver_data: today,
  expire_date: 99999999999,
  status: "unread",
  deliver_date: new Date().getTime() / 1000
}
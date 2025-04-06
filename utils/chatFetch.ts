
type ChatMsgPayload = {
  chatId:number,
  ques:string,
  ans:string,
}
export async function saveChatMsg(paylaod:ChatMsgPayload){
  const url = "/api/addChatMsg";
  try {
    const res = await fetch(url, {
      method:"POST",
      body:JSON.stringify(paylaod),
    });

    if(res.ok){
      return await res.json();
    }
    let json = await res.json();
    throw new Error(json.msg??"");
  } catch(error) {
    throw new Error('Error Occured!');
  }
}
export async function getChatList(){
  const url = "/api/chatList";
  try {
    const res = await fetch(url);
    if(res.ok){
      return await res.json();
    }
    let json = await res.json();
    throw new Error(json.msg??"");
  } catch(error) {
    throw new Error('Error Occured!');
  }
}
export async function getChatMsg(chatId:string){
  const url = "/api/chatMsg?chat_id="+chatId;
  try {
    const res = await fetch(url);
    if(res.ok){
      return await res.json();
    }
    let json = await res.json();
    throw new Error(json.msg??"");
  } catch(error) {
    throw new Error('Error Occured!');
  }
}
export async function deleteChat(chatId:string){
  const url = "/api/chat";
  try {
    const res = await fetch(url, {
      method:"DELETE",
      body:JSON.stringify({chatId:chatId})
    });
    if(res.ok){
      return await res.json();
    }
    let json = await res.json();
    throw new Error(json.msg??"");
  } catch(error) {
    throw new Error('Error Occured!');
  }
}

let button = document.querySelector('button')
const spinner = '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><use href="#icon.spinner"></use></svg>'

function ClearInput(){
    let inputs = document.querySelectorAll('input')
    inputs.forEach(e=>{
      e.value = ""
      e.style.border = "1px solid red"
      
    })
   
   setTimeout(()=>{
    inputs[0].focus()
   },500)
  }

  function setMessage(message,isError){
 let elem =   document.getElementById("error")
    if(isError){
        elem.style.color = "red"
        elem.innerHTML = message
    }else{
        elem.style.color = "green"
        elem.innerHTML = message 
    }
  
    ClearInput()
 
  }


  function sendDataToServer(url ,form,text,text2){
    let buttonText  = text
button.innerHTML = `${spinner} ${text2}..`
    const formData = new FormData(form);
  const params = new URLSearchParams(formData)
  
    fetch(url, {
    method: "POST",
    body: params,
  })
    .then((response) => {
       if(response.status  === 404){
  setMessage("User doesn't Exist",true)
  button.innerHTML = buttonText
      }else if(response.status  === 409){
        button.innerHTML = buttonText
        setMessage("Invalid Credientilas",true)
      }else if(response.status === 500){
        button.innerHTML = buttonText
        setMessage("Email is already in use",true)
      }
      if(response.ok){
        button.innerHTML = buttonText
      }
      return response.json(); 
    })
    .then((data) => {  
       if(data.message == "sent"){
        setMessage("Message sent ! please check your email",false)
       }else if(data.message == "created"){
        button.innerHTML = "User Created"
        renderNewPage("/")
       }else if(data.message == "found"){
        renderNewPage("home")
       }
    })
    .catch((error) => {
     setMessage(error,true)
     console.log(error)
     button.innerHTML = `Error`
    });
  }
  

  function renderNewPage(url){
    let a = document.createElement('a')
    a.href = url
    a.click()
  }
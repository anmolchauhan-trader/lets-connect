




  
    async function UsingApi(data,path,method){
    try{
      const res=await fetch( path,{
      method:method,
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: data.email, password: data.password })
    });
   
    let response=res;
    console.log(response);
    
   
    if (!response.ok) {
      error.textContent = 'Login failed. Please check your credentials.';
      return;}
          return response; }
      catch(error){
        error.textContent = 'An error occurred. Please try again.';
        
      }
     
    }
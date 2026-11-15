




  
    async function UsingApi(data,path,method){
    try{
      const res=await fetch( path,{
      method:method,
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: data.email, password: data.password })
    });
   
    let response= await res.json();
   
    if (!response.ok) {
      error.textContent = 'Login failed. Please check your credentials.';
      return;}}
      catch(e){
        error.textContent = 'An error occurred. Please try again.';
        
      }
     return response; 
    }
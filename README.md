install all dependencies in pakage,json file   

add this in config.env file  

PORT = ****  
SESSION_SECRET = secret for your session used by passport js (write anything)
GOOGLE_CLIENT_ID=  from google oauth2
GOOGLE_CLIENT_SECRET =from google oauth2
GOOGLE_CALLBACK_URL= http://localhost:5000/auth/google/callback  (callback url change should be same as submitted while registering on google cloud credential )
SECRET_KEY = security key for adding (write anything)
DATABASE = url to connect database




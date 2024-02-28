# Web Development Project - Boston University CS392 (Fall 2023)

This repository is a copy of my project for Boston University's CS392 course in the fall of 2023. I collaborated with three other students - Hannah F., Rina T., and Manya B. The project involves the development of a web application with both client-side and server-side components. Please note that any attempt to copy this repository without proper attribution may be considered a violation of academic integrity. 


## Features

1. **Signup & Login:** Users can register and select their event preferences. Upon successful login, a JWT token is provided for authentication.
   
2. **Profile:** Users can view and edit their profiles, and see the events they've posted.
   
3. **Events:**  Displays all available events. Users can filter these events based on tags.
   
4. **Create Events:** Authorized users, approved by admins, can post events and add associated images.


## Directory Structure

- `/client`: Holds all client-side code
    - `/client/src/common`: Contains frequently used files like constants or interfaces.
    - `/client/src/components`: Currently holds the loading components, more components like navbar can be added.
    - `/client/src/contexts/AuthContext.tsx`: Wrapper around `_app.tsx` to manage authentication context.
    - `/client/src/pages`: Contains all frontend pages.
    
- `/server`: Contains all server-side code
  - `/server/server.ts` contains the code to start the server.
  - `/server/app` contains the majority of the code for the server.
    - Each folder in `/server/app` contains the code for a specific feature.
   
## Technologies and Frameworks Used
- **Frontend:** Next.js (TypeScript)
- **Backend:** Express.js (TypeScript)
- **Authentication:** JSON Web Token (JWT) for secure authentication and bcrypt for password encryption.
- **Database:** PostgreSQL




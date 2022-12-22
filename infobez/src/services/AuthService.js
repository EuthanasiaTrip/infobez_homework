import axios from "axios";

export default {
    async login(userName){
        let result = await axios.post("http://localhost:5000/login", {
            userName: userName
        });

        if(result.status === 200){
            return result.data;
        } else {
            console.log("Login error");
        }
    },

    async logout(){
        let result = await axios.post("http://localhost:5000/logout", {});

        if(result.status === 200){
            console.log(result.data);
            return true;            
        }
    },
    
    async getCurrentUser(){
        let result = await axios.get("http://localhost:5000/currentUser");

        if(result.status === 200){
            return result.data;
        }
    },

    async getAllUsers(){
        let result = await axios.get("http://localhost:5000/allUsers");

        if(result.status === 200){
            return result.data;
        }
    },

    async randomizeRights(){
        let result = await axios.post("http://localhost:5000/randomizeRights", {});

        if(result.status === 200){
            return result.data;
        }
    },

    rightsToLczString (rightsArray) {
        let rightsStr = "";
        const lczRights = [
          {
            rightName: "read",
            lczName: "Чтение",
          },
          {
            rightName: "write",
            lczName: "Запись",
          },
          {
            rightName: "grant",
            lczName: "Передача прав",
          },
        ];
        if (rightsArray.length === 3) {
          rightsStr = "Полные права";
          return rightsStr;
        }
        rightsArray.forEach((element) => {
          const rightName = lczRights.find((item) => item.rightName === element);
          if (rightName) {
            rightsStr += `${rightName.lczName}, `;
          }
        });
  
        if (rightsArray.length > 0) {
          let trimString = rightsStr.trim();
          rightsStr = trimString.replace(/(^,)|(,$)/g, "");
        } else {
          rightsStr = "Нет прав";
        }
  
        return rightsStr;
      },
}
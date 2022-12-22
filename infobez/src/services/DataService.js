import axios from 'axios';

export default {
    async getRightsOnObjectByUser(objectName, userName){
        let link = "http://localhost:5000/getObjectsByUser";
        if(objectName){
            link += `?objectName=${objectName}`;
            if(userName){
                link += `&userName=${userName}`;
            }
        }

        let result = await axios.get(link);

        if(result.status === 200){
            return result.data;
        }
    },

    async getAllRights(){
        let link = "http://localhost:5000/getAllObjects";
        let result = await axios.get(link);

        if(result.status === 200){
            return result.data;
        }
    },

    async updateRights(request){
        let link = "http://localhost:5000/update";
        let result = await axios.post(link, request);

        if(result.status === 200){
            console.log(result.data);
            return result.data;          
        }
    },

    async updateValue(request){
        let link = "http://localhost:5000/updateValue";
        let result = await axios.post(link, request);

        if(result.status === 200){
            return result.data;
        }
    },

    async readValue(objectName){
        let link = "http://localhost:5000/readValue";
        if(objectName){
            link += `?objectName=${objectName}`;
        }

        let result = await axios.get(link);

        if(result.status === 200){
            return result.data;
        }
    }

}
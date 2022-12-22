import express, { response } from 'express';
import fs from 'fs'
import cors from 'cors';

const app = express();

const jsonData = loadJSONData();
let objects = jsonData.objects;
let users = jsonData.users;
let currentUser;

console.log(objects);

function loadJSONData() {
    let rawDataObjects = fs.readFileSync('objects.json');
    let rawDataUsers = fs.readFileSync('users.json');

    let objects = JSON.parse(rawDataObjects);
    let users = JSON.parse(rawDataUsers);

    return {
        objects,
        users: users.users
    };
}

function updateJSONData() {
    fs.writeFileSync("backup-data.json", fs.readFileSync('objects.json'));
    fs.writeFileSync("objects.json", JSON.stringify(objects));
}

function checkCanPerformOperation(objectName, userName, operation) {
    let result = false
    const object = objects[objectName];
    if (!object) {
        return result;
    }

    const userOpertaions = object[userName];
    if (!userOpertaions) {
        return result;
    }

    if (userOpertaions.includes(operation)) {
        result = true;
    }

    return result;
}

function getCurrentUserRights(objectName) {
    if (!currentUser) {
        return;
    }
    let result = null;
    const object = objects.find(item => item.name === objectName);
    if (object) {
        result = object.rights[currentUser];
    }
    return result;
}

function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

function randomizeRights() {
    for (let index = 0; index < objects.length; index++) {
        users.forEach(userName => {
            if(userName == "admin") return;
            let randomRights = []                    
            let canRead = getRandomInt(0,1);
            let readGrant = getRandomInt(4,7);
            if(canRead){
                randomRights.push("read");
                switch(readGrant){
                    case 5:
                        randomRights.push("write");
                        break;
                    case 6:
                        randomRights.push("grant");
                        break;
                    case 7:
                        randomRights.push("grant");
                        randomRights.push("write");
                        break;
                }                
            }

            objects[index].rights[userName] = randomRights;
        })
    }
    updateJSONData();
}

app.use(cors());
app.use(express.json());

/**
 * Получить уровни доступа текущего пользователя к конкретному или к одному объекту
 */
app.use("/getObjectsByUser", (request, response) => {
    const query = request.query;
    let result = [];
    if (query && query.objectName) {
        const object = objects.find(item => { return item.name === query.objectName }).rights;
        result.push({
            name: query.objectName,
            rights: query.userName ? object[query.userName] : object[currentUser]
        });
    } else {
        objects.forEach(obj => {
            result.push({
                name: obj.name,
                rights: getCurrentUserRights(obj.name)
            });
        });
    }
    response.send(result);
});

/**
 * Получить матрицу доступа всех объектов
 */
app.use("/getAllObjects", (request, response) => {
    const query = request.query;
    let result = objects;
    response.send(result);
});

/**
 * Обновить значение прав для объекта
 */
app.post("/update", (request, response) => {
    const objectName = request.body.objectName;
    const userName = request.body.userName;
    const rightLvls = request.body.rights;
    const isForceUpdate = request.body.isForceUpdate;

    let result = {
        success: false,
        errorMsg: ""
    }

    if (!users.includes(userName)) {
        result.errorMsg = `Error while updating rights: user not found, query body: objectName: ${objectName}, userName: ${userName}, rights:${rightLvls}`;
        response.send(result);
        return;
    }

    const index = objects.findIndex(obj => obj.name === objectName);
    if (index != -1) {
        if (!isForceUpdate) {
            const initialRights = objects[index].rights[userName];
            objects[index].rights[userName] = arrayUnique([...initialRights, ...rightLvls]);
        } else {
            objects[index].rights[userName] = rightLvls;
        }
        updateJSONData();
    } else {
        result.errorMsg = `Error while updating rights: object not found, update query: objectName: ${objectName}, userName: ${userName}, rights:${rightLvls}`;
        response.send(result);
        return;
    }

    result.success = true;
    response.send(result);
});

app.post("/updateValue", (request, respone) => {
    const value = request.body["value"];
    const objectName = request.body["objectName"];

    if (value && objectName) {
        objects.find(item => item.name == objectName).value = value;
    }

    respone.send({ success: true });
});

app.get("/readValue", (request, response) => {
    const query = request.query;
    let result = {
        success: false,
        value: ""
    }

    if (query && query.objectName) {
        result.value = objects.find(item => item.name == query.objectName).value;
        result.success = true;
    }

    response.send(result);
});

app.post("/login", (request, response) => {
    const userName = request.body["userName"];
    const result = {
        success: false
    };
    if (users.includes(userName)) {
        currentUser = userName;
        result.success = true;
    }

    response.send(result);
})

app.post("/logout", (request, response) => {
    currentUser = null;
    response.send("Logout successful");
});

app.get("/rights", (request, response) => {
    const result = {
        success: false
    };

    if (!currentUser) {
        response.send(result);
    }

    const objectName = request.body["objectName"];
    if (!objectName) {
        response.status(400).send("Bad Request");
        return;
    }

    const rights = getCurrentUserRights(objectName);
    response.send(rights);
});

app.get("/currentUser", (request, response) => {
    response.send(currentUser);
});

app.get("/allUsers", (req, response) => {
    response.send(users);
});

app.post("/randomizeRights", (req, response) => {
    randomizeRights();
    response.send("Randomized successfully!");
});

app.listen(5000);
console.log("server started");
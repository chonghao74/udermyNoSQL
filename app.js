const express = require("express");//use express
const mongoose = require('mongoose');//use mongoose
const fs = require('fs');
const app = express();
const { Schema } = mongoose;//make schema

app.use(express.static("public"));// 設定 css 路由為 public
app.set("view engine", "ejs");//設定後，若 render EJS file 就不用副檔名

//mongoose connect
mongoose.connect('mongodb://127.0.0.1:27017/school').then(() => {
    console.log("連結 MongoDB Success");
}).catch((e) => {
    console.log(`連結 MongoDB Fail ${e}`);
});


//define a schema
const studentSchema = new Schema({
    name: String,
    age: {
        type: Number,
        min: [12, 'Too young'],
        max: [150, 'Too old'],
        required: [true, 'Why no age?']
    },
    major: { type: String },
    classtimetable: [String],
    basic: {
        h: {
            type: Number,
            min: [30, 'Error H'],
            max: 300
        }, w: Number, g: {
            type: String,
            enum: ['M', 'F']
        }
    }
});

//define schema instance methoed
studentSchema.methods.calBmi = function () {
    console.log(this);
    console.log(this.basic.w);
    console.log(this.basic.h);
    const bmi = ((this.basic.w) / (Math.pow((this.basic.h / 100), 2))).toFixed(2);
    return bmi;
}

studentSchema.methods.changeAge = function () {
    let calAge = this.age;
    if (calAge >= 100) {
        this.age = calAge - 100;
    }
    else {
        this.age++;
    }

    this.save();
}

//define a static Method
studentSchema.statics.testStatic = function () {
    return this.updateMany({ __v: 1 }, { __v: 0 });
}

//define middleware
studentSchema.pre("save", async function () {
    const date = getLogTime();
    // fs.access('/log/logRecord.txt', constants.F_OK, (err) => {
    //     console.log(`${file} ${err ? 'does not exist' : 'exists'}`);
    // });


    fs.appendFile("./log/logRecord.txt", `Start Succes - ${date}`, e => {
        if (e) {
            fs.writeFile("./log/logRecord.txt", `Start Succes - ${date}`, e => {
                if (e) {
                    console.log("PRE-" + e)
                }
            });
        }
    });
});

studentSchema.post("save", async function () {
    const date = getLogTime();

    fs.appendFile("./log/logRecord.txt", `End Succes - ${date}`, e => {
        if (e) {
            fs.writeFile("./log/logRecord.txt", `End Succes - ${date}`, e => {
                if (e) { console.log("POST-" + e) }
            });
        }
    });
});

//create a Model for Student
const Student = mongoose.model("Student", studentSchema);
//insert data
//e.g.1 by query
//Valitators Success Case
// const newStudent = new Student({
//     name: "Error08091101",
//     age: 2,
//     major: "Bussiness",
//     classtimetable: ["A", "B", "C", "D", "E"],
//     basic: { h: 300, w: 65, g: "M" }
// });

//Valitators Fail Case
// const newStudent = new Student({
//     name: "Error08091101",
//     age: 11,
//     major: "Bussiness",
//     classtimetable: ["A", "B", "C", "D", "E"],
//     basic: { h: 300, w: 65, g: "M" }
// });

// newStudent.save()
//     .then(data => {
//         console.log("Success Insert DB");
//         console.log(data)
//     })
//     .catch(e => {
//         console.log("Save-" + e);
//         const date = getLogTime();
//         fs.appendFile("./log/logRecord.txt", `Fail Succes - ${date}`, e => {
//             if (e) {
//                 fs.writeFile("./log/logRecord.txt", `Fail Succes - ${date}`, e => {
//                     if (e) { console.log("POST-" + e) }
//                 });
//             }
//         });
//     });

//e.g.2
// const Person = mongoose.model("Person", studentSchema);
// const newPerson = new Person({
//     name: "Hb",
//     age: 20,
//     major: "Bussiness",
//     classtimetable: ["A", "B", "C", "D", "E"],
//     basic: { h: 170, w: 65, g: "F" }
// });

// newPerson.save()
//     .then(data => {
//         console.log("Success Insert DB");
//         console.log(data)
//     })
//     .catch(e => {
//         console.log(e);
//     });

async function findPerson() {
    try {
        let data = await Person.find({}).limit().exec();

    }
    catch (e) {
        console.log(e);
    }

    // Person.find({}).limit(3).exec()
    // .then(data => {
    //     console.log(data);
    // })

}



app.get("/home", (req, res) => {
    const students = mongoose.model("students", studentSchema);
    fs.open("./log/logRecord.txt", 'r+', (e, fd) => {
        if (e) throw e;
        console.log('檔案開啟成功!');
        //let buffr = new Buffer(1024);//deprecated
        let buffr = Buffer.alloc(1024);

        fs.read(fd, buffr, 0, buffr.length, 0, function (err, bytes) {

            if (err) throw err;

            // Print only read bytes to avoid junk.
            if (bytes > 0) {
                console.log(bytes + " 字元被讀取");
                console.log(buffr.slice(0, bytes).toString());//buffr.slice deprecated
                console.log(buffr.subarray(0, bytes).toString());
            }

            // Close the opened file.
            fs.close(fd, function (err) {
                if (err) throw err;
            });
        });
    })


    //const students = mongoose.model("student", { name: String, age: Number });

    //Update
    // students.updateOne({ age: { $eq: 13 } }, { age: 12 })
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     });

    // students.updateMany({ age: { $eq: 12 } }, { age: 13 })
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     });

    // students.findOneAndUpdate({ age: { $eq: 12 } }, { age: 13 }, { new: true })
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     });

    // students.findOneAndUpdate({ age: { $eq: 49 } }, { age: 200 }, { new: true, runValidators: true })
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     });

    //利用 find/findOne + Schema instance Method + document.save() 更新資料 
    // students.find({ age: { $gte: 0 } }).then(data => {
    //     data.forEach(o => {
    //         o.changeAge()
    //     });
    //     console.log(data);
    // })
    //     .catch(e => {
    //         console.log(e);
    //     });

    //利用 Schema static + Model updateMany 更新資料
    // students.testStatic().then(data => {
    //     console.log(data);
    // })
    //     .catch(e => {
    //         console.log(e);
    //     });

    //Read
    // students.findOne({ age: { $eq: 13 } })
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     });

    // students.find({ age: { $eq: 13 } }).then(data => {
    //     console.log(data);
    // }).catch(e => {
    //     console.log(e);
    // });

    //use schema instance method
    // students.find({ age: { $gte: 10 } }).then(data => {
    //     data.forEach(o => {
    //         console.log(o.calBmi());
    //     })
    // })
    //     .catch(e => {
    //         console.log(e);
    //     })

    //Delete
    // students.deleteOne({ age: { $eq: 50 } }).then(data => {
    //     console.log(data);
    // }).catch(e => {
    //     console.log(e);
    // });

    // students.findOneAndDelete({ name: { $eq: 'Error' } }).then(data => {
    //     console.log(data);
    // }).catch(e => {
    //     console.log(e);
    // });

    // students.deleteMany({ age: { $gte: 50 }, name: 'Error' }).then(data => {
    //     console.log(data);
    // }).catch(e => {
    //     console.log(e);
    // });

    res.status(200).render("home");
});

app.get("*", (req, res) => {
    res.send("Error");

});

function getLogTime() {
    let datetest = new Date();
    return `${datetest.getFullYear()}-${datetest.getMonth() + 1}-${datetest.getDate()} ${datetest.getHours()}-${datetest.getMinutes()}-${datetest.getSeconds()}\n`
}

app.listen(3000, () => {
    console.log("listtening port 3000");
})
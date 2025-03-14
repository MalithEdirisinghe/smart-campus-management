module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define("attendance", {
        studentId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        attendance: {
            type: DataTypes.ENUM('Present', 'Absent', 'Late'),
            allowNull: false
        },
        classroom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        module: {
            type: DataTypes.STRING,
            allowNull: false
        },
        batch: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    }, {
        tableName: "attendance",
        timestamps: true
    });

    return Attendance;
};

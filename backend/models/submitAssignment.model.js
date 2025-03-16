module.exports = (sequelize, DataTypes) => {
    const SubmitAssignment = sequelize.define("submit_assignment", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        student_user_id: {
            type: DataTypes.STRING
        },
        submitted_assignment: {
            type: DataTypes.BLOB
        },
        module: {
            type: DataTypes.STRING
        },
        batch: {
            type: DataTypes.STRING
        },
        submitted_at: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'submit_assignment', // Ensure the table name matches your database table
        timestamps: false // Disable timestamps if your table doesn't use them
    });

    return SubmitAssignment;
};

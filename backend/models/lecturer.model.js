module.exports = (sequelize, DataTypes) => {
    const Lecturer = sequelize.define('Lecturer', {
      lecturerId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
        field: 'lecturer_id'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'department'
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'specialization'
      }
      // If your table actually has columns like first_name, last_name, start_date, etc.,
      // you can map them similarly. But from your screenshot, it looks like only these four columns:
      // lecturer_id, user_id, department, specialization
    }, {
      tableName: 'lecturer_users', // matches your table name exactly
      freezeTableName: true,       // prevents Sequelize from pluralizing it
      timestamps: false            // or true, if you do have created_at, updated_at columns
    });
  
    // Comment out the belongsTo association if your User model is not a Sequelize model.
    // Lecturer.associate = (models) => {
    //   Lecturer.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    // };
  
    return Lecturer;
  };
  
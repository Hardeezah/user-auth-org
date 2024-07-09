const { Organisation, UserOrganisations, User } = require('../models');

exports.createOrganisation = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { userId } = req.user;

    if (!name) {
      return res.status(422).json({
        errors: [
          {
            field: 'name',
            message: 'Organisation name is required',
          },
        ],
      });
    }

    const organisation = await Organisation.create({
      orgId: uuidv4(),
      name,
      description,
    });

    await UserOrganisations.create({
      userId,
      orgId: organisation.orgId,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getUserOrganisations = async (req, res) => {
  try {
    const { userId } = req.user;

    const organisations = await Organisation.findAll({
      include: [
        {
          model: User,
          through: {
            where: { userId },
          },
        },
      ],
    });

    return res.status(200).json({
      status: 'success',
      message: 'Organisations fetched successfully',
      data: { organisations },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getOrganisation = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { userId } = req.user;

    const organisation = await Organisation.findOne({
      where: { orgId },
      include: [
        {
          model: User,
          through: {
            where: { userId },
          },
        },
      ],
    });

    if (!organisation) {
      return res.status(404).json({
        status: 'error',
        message: 'Organisation not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Organisation fetched successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.addUserToOrganisation = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { userId } = req.body;

    const organisation = await Organisation.findOne({ where: { orgId } });
    if (!organisation) {
      return res.status(404).json({
        status: 'error',
        message: 'Organisation not found',
      });
    }

    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    await UserOrganisations.create({
      userId,
      orgId,
    });

    return res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

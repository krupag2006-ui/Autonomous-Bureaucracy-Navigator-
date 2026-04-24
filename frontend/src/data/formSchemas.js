export const formSchemas = {
  building: {
    file: "/forms/building_plan_application.pdf",
    fields: {
      owner_name: "owner_name",
      location: "location",
      plot_number: "plot_number",
    },
  },

  electricity: {
    file: "/forms/electricity_connection_form.pdf",
    fields: {
      name: "name",
      address: "address",
    },
  },

  water: {
    file: "/forms/water_connection_form.pdf",
    fields: {
      name: "name",
      address: "address",
      dob: "dob",
    },
  },
};

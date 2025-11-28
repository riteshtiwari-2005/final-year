import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useQuery } from "@tanstack/react-query";
import { publicRequest } from "../../Utils/requestMethods";
import { useState } from "react";


const MechanicsForm = (props) => {
  const mechanicsDisabled = props.disable;
  const [mechanic, setMechanic] = useState(props.mechanic);
  let availableSlot1 = false;
  let availableSlot2 = false;
  let availableSlot3 = false;
  let availableSlot4 = false;

  const handleChangeTime = (newValue) => {
    setMechanic(newValue.target.value);
    // props.mechanic(newValue.target.value);
    props.onChange(newValue.target.value);
  };

  const [showAll, setShowAll] = useState(false);

  const { data: workers = [], isLoading } = useQuery({
    queryKey: ["workersList", props.service],
    queryFn: async () => {
      const url = props.service ? `/workers?serviceId=${props.service._id || props.service}` : "/workers";
      const res = await publicRequest.get(url);
      return res.data;
    },
  });

  const { data: allWorkers = [] } = useQuery({
    queryKey: ["allWorkers"],
    queryFn: async () => {
      const res = await publicRequest.get("/workers");
      return res.data;
    },
    enabled: showAll,
  });

  return (
    <div>
      <FormControl
        disabled={mechanicsDisabled}
        required
        sx={{ m: 1, minWidth: 200 }}
      >
        <InputLabel id="demo-simple-select-required-label">Professionals</InputLabel>
        <Select
          labelId="demo-simple-select-required-label"
          id="demo-simple-select-required"
          value={mechanic}
          label="Professional *"
          onChange={handleChangeTime}
        >
          <MenuItem value={""}>
            <em>None</em>
          </MenuItem>
          {isLoading ? (
            <MenuItem value="loading">Loading...</MenuItem>
          ) : ( 
            (showAll ? allWorkers : workers).map((w) => (
              <MenuItem key={w._id} value={w._id}>
                {w.firstname} {w.surname}
              </MenuItem>
            ))
          )}
          {!isLoading && !showAll && props.service && workers.length === 0 && (
            <MenuItem onClick={() => setShowAll(true)} value="show_all">Show all professionals</MenuItem>
          )}
        </Select>
        <FormHelperText>Select one of our Professionals</FormHelperText>
      </FormControl>
    </div>
  );
};

export default MechanicsForm;

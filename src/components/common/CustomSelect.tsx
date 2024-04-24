import { Box } from '@mantine/core';
interface CustomSelectProps {
  selectBG: {
    color: string;
    image: string;
    posX: string;
    posY: string;
    hasBorder?: string;
  };
  default?: string;
  data: {
    label: string;
    value: number | string;
  }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  width: string;
  height: string;
  required?: boolean;
  disabled?: boolean;
}

const CustomSelect = (props: CustomSelectProps) => {
  return (
    <Box
      component="select"
      className="custom_select"
      style={{
        background: `${props.selectBG.color} url(${props.selectBG.image}) no-repeat`,
        backgroundPositionX: props.selectBG.posX,
        backgroundPositionY: props.selectBG.posY,
        width: props.width,
        height: props.height,
        textTransform: 'capitalize',
        border: props.selectBG.hasBorder,
      }}
      disabled={props.disabled}
      onChange={props.onChange}
      required={props.required}
    >
      <option selected disabled hidden>
        {props.default}
      </option>
      {props.data.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </Box>
  );
};

export default CustomSelect;

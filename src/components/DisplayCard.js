import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Alert from './Alert';

const useStyles = makeStyles({
  card: {
    minWidth: 275,
  },
  title: {
    fontSize: 14,
  },
});

export default function DisplayCard(props) {
  const classes = useStyles();
  const [alertOn, setAlertOn] = React.useState(false);

  if (props.basic){
      return (
        <Card className={classes.card}>
        <CardContent>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            {props.header}
          </Typography>
          <Typography variant="h5" component="h2">
            {props.message}
          </Typography>
        </CardContent>
      </Card>
      )
  }

  return (
    <Card className={classes.card}>
        {alertOn 
        ? 
        <Alert header={`Opinion of ${props.posek}`} message="some pretty good explanation of why the times are different..." resetAlert={()=> setAlertOn(false)}/> 
        : null}
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          {`Opinion of ${props.posek}`}
        </Typography>
        <Typography variant="h5" component="h2">
          Earliest: 
          <br />
          {props.start}
          <br /><br />
          Latest: 
          <br />
          {props.end}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => setAlertOn(true)}>Learn More</Button>
      </CardActions>
    </Card>
  );
}
import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme, fade } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import DateRange from '@material-ui/icons/DateRange';
import WatchLater from '@material-ui/icons/WatchLater';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { getStartAndEnd } from '../utils/moladCalcs.js';
import DisplayCard from './DisplayCard.js';
import Cancel from '@material-ui/icons/Cancel';
import { InputBase, Popover } from '@material-ui/core';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import Alert from './Alert.js';

const drawerWidth = 300;

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
	},
	inputRoot: {
		color: 'inherit',
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 7),
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('md')]: {
			width: 200,
		},
	},
	search: {
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25),
		},
		marginRight: theme.spacing(2),
		marginLeft: 0,
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(3),
			width: 'auto',
		},
	},
	searchIcon: {
		width: theme.spacing(7),
		height: '100%',
		position: 'absolute',
		pointerEvents: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	appBar: {
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
	},
	appBarShift: {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: drawerWidth,
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	popover: {
		pointerEvents: 'none',
	},
	paper: {
		padding: theme.spacing(1),
	},
	hide: {
		display: 'none',
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
	},
	drawerHeader: {
		display: 'flex',
		alignItems: 'center',
		padding: '0 8px',
		...theme.mixins.toolbar,
		justifyContent: 'flex-end',
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		marginLeft: -drawerWidth,
	},
	contentShift: {
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
		marginLeft: 0,
	},
}));

export default function SideNav(props) {
	// console.log(document.getElementsByTagName("input"));
	// console.log(document.getElementsByTagName("input"));
	// if (document.getElementsByTagName("input")[1]){
	// 	document.getElementsByTagName("input")[1].autofocus=true;
	// 	console.log(document.getElementsByTagName("input")[1]);
	// }
	const classes = useStyles();
	const [open, setOpen] = React.useState(true);
	const [zipcode, setZipcode] = React.useState('');
	const [anchorEl, setAnchorEl] = React.useState(null);
	const openPopover = Boolean(anchorEl);
	const [showDatepicker, setShowDatepicker] = React.useState(false);

	function handlePopoverOpen(event) {
		setAnchorEl(event.currentTarget);
	}

	function handlePopoverClose() {
		setAnchorEl(null);
	}

	function handleDrawerOpen() {
		setOpen(true);
	}

	function handleDrawerClose() {
		setOpen(false);
	}

	function handleInputZipcode(value) {
		setZipcode(value);
	}

	function handleZipcodeEnter(key) {
		if (key === 'Enter') {
			props.setZipcode(zipcode);
		}
	}

	function handleCalendarClick() {
		console.log("SSS")
		setShowDatepicker(true);
	}

	function getSidebar() {
		return (
			<Drawer
				className={classes.drawer}
				variant="persistent"
				anchor="left"
				open={open}
				classes={{
					paper: classes.drawerPaper,
				}}
			>
				<div className={classes.drawerHeader}>
					Molad and Kiddush Levana Times
          <IconButton onClick={handleDrawerClose}>
						<Cancel />
					</IconButton>
				</div>
				<Divider />
				{getMoladInfo()}

			</Drawer>
		);
	}

	function numToDay(num) {
		const daysArray = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'];
		return daysArray[num];
	}

	function numToMonth(num) {
		const monthsArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		return monthsArray[num];
	}


	function getHumanReadable(time) {
		var [month, dayAsWord, dayAsNum, hour, minutes, second] = [numToMonth(time.getMonth()), numToDay(time.getDay()), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()];
		return `${dayAsWord}, ${month} ${dayAsNum} (${hour}:${minutes}:${second})`;
	}

	function getMoladInfo() {
		if (!props.moladInfo.molad) return null;
		getHumanReadable(props.moladInfo.molad);
		var [ShA_start, ShA_end] = getStartAndEnd(props.moladInfo.molad, 7, 15);
		var [Rama_start, Rama_end] = getStartAndEnd(props.moladInfo.molad, 3, 14.6);//TODO: get exact time for Rama

		return (
			<List>
				<ListItem>
					<ListItemText primary={`Molad in ${props.moladInfo.location}:`} />
					<DisplayCard basic={true} posek="Rama" header={`Molad in ${props.moladInfo.location}:`} message={getHumanReadable(props.moladInfo.molad)} />
				</ListItem>
				<ListItem>
					<DisplayCard posek="Shulchan Aruch" start={getHumanReadable(ShA_start)} end={getHumanReadable(ShA_end)} />
				</ListItem>
				<ListItem>
					<DisplayCard posek="Rama" start={getHumanReadable(Rama_start)} end={getHumanReadable(Rama_end)} />
				</ListItem>
			</List>
		)
	}

	return (
		<div className={classes.root}>
			<CssBaseline />
			<AppBar
				position="fixed"
				className={clsx(classes.appBar, {
					[classes.appBarShift]: open,
				})}
			>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						edge="start"
						className={clsx(classes.menuButton, open && classes.hide)}
					>
						<WatchLater />
					</IconButton>
					<Typography variant="h6" noWrap>
						Kiddush Levana App
          </Typography>
					<div className={classes.search}>
						<div className={classes.searchIcon}>
							<IconButton color="inherit">
								<SearchIcon />
							</IconButton>
						</div>
						<InputBase
							placeholder="Enter Zipcode…"
							classes={{
								root: classes.inputRoot,
								input: classes.inputInput,
							}}
							inputProps={{ 'aria-label': 'search' }}
							onChange={(event) => handleInputZipcode(event.target.value)}
							onKeyDown={(event) => handleZipcodeEnter(event.key)}
						/>
					</div>
					<IconButton
						color="inherit"
						aria-owns={openPopover ? 'mouse-over-popover' : undefined}
						aria-haspopup="true"
						onMouseEnter={handlePopoverOpen}
						onMouseLeave={handlePopoverClose}
						onClick={handleCalendarClick}
					>
						<DateRange />
					</IconButton>

					<div>
						<Popover
							id="mouse-over-popover"
							className={classes.popover}
							classes={{
								paper: classes.paper,
							}}
							open={openPopover}
							anchorEl={anchorEl}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							onClose={handlePopoverClose}
							disableRestoreFocus
						>
							<Typography>Click to choose a different date.</Typography>

						</Popover>
					</div>
				</Toolbar>
			</AppBar>

			{getSidebar()}
			<main
				className={clsx(classes.content, {
					[classes.contentShift]: open,
				})}
			>
				<div className={classes.drawerHeader} />
				{props.innerComponent}
			</main>
			{showDatepicker ? <Alert message={<DayPicker onDayClick={props.setNewDate} />} resetAlert={() => setShowDatepicker(false)} /> : null}
		</div>
	);
}

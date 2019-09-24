import React from 'react';
import clsx from 'clsx';
import { makeStyles, fade } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import WatchLater from '@material-ui/icons/WatchLater';
import ListItem from '@material-ui/core/ListItem';
import DisplayCard from './DisplayCard.js';
import Cancel from '@material-ui/icons/Cancel';
import { InputBase } from '@material-ui/core';
import 'react-day-picker/lib/style.css';
import { HDate } from 'hebcal';
import { getHebMonthAsString } from '../utils/tools.js';

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
	const classes = useStyles();
	const [open, setOpen] = React.useState(true);
	const [zipcode, setZipcode] = React.useState('');

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

	function getHumanReadable(time) {
		var chalakim = Math.round((time.getSeconds()) / (3.333));
		if (chalakim === 18) {
			chalakim = 0;
		}
		var fullTime = time.toString().substring(0, time.toString().indexOf("G"));
		var dateSection = fullTime.substring(0, fullTime.length - 10);
		var timeSection = fullTime.substring(fullTime.length - 9, fullTime.length - 4);
		var asStringArray = timeSection.trim().split(":");
		var minutes = asStringArray[1];
		var militaryHour = parseInt(asStringArray[0]); 
		var hour = militaryHour <= 12 ? militaryHour : militaryHour - 12;
		var pmOrAm = militaryHour <= 12 ? "am" : "pm";
		if (hour === 0) hour = 12; 

		return `${dateSection} at ${hour}:${minutes} ${pmOrAm} and ${chalakim} chalakim`;
	}

	function getMoladInfo() {
		if (!props.sidebarData) return (
			<DisplayCard basic={true} message="Click an opinion in the calendar to see exact times and explanations" />
		);
		var data = props.sidebarData;
		var molad = data.opinion.molad;
		var aFewDaysAfterMolad = new Date(molad.getTime() + (3 * 24 * 60 * 60 * 1000));
		var upcomingHebMonthAsNum = new HDate(aFewDaysAfterMolad);
		var upcomingHebMonthAsString = getHebMonthAsString(upcomingHebMonthAsNum);
		return (
			<List>
				<ListItem>
					<DisplayCard basic={true} header={null} message={`Hebrew month: ${upcomingHebMonthAsString}`} />
				</ListItem>
				<ListItem>
					<DisplayCard basic={true} header={`Molad in ${data.location}:`} message={getHumanReadable(molad)} />
				</ListItem>
				<ListItem>
					<DisplayCard posek={data.opinion.title} start={getHumanReadable(data.opinion.start)} end={getHumanReadable(data.opinion.end)} />
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
		</div>
	);
}

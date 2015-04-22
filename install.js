if(process.platform !== 'darwin') {
	require('child_process').spawn('install.bat', [], { stdio:'inherit' });
} else {
	console.log('OSX support is not here yet. But soon.');
}
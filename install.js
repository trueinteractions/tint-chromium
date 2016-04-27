if(process.platform !== 'darwin') {
	require('child_process').spawn('install.bat', [], { stdio:'inherit' });
} else {
	require('child_process').spawn('install.sh', [], { stdio:'inherit' });
}

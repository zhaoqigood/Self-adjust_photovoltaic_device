struct ComputeResult
{
	
};

ComputeResult compute(
	double inputLongitude,
	double inputLatitude,
	double inputElevation, // in meter
	bool clockTimeInputMode, // 时钟时
	bool East,
	bool South,
	int daylight = 0, // 夏令时
	)
{
    // avoid math errors due to latitude or longitude = 0
	if (inputLatitude == 0)
		inputLatitude = 0.000000001;
	if (inputLongitude == 0)
		inputLongitude = 0.000000001;
	bool lsotInputMode = !clockTimeInputMode;
	ComputeResult result;
	if (East) inputLongitude *= -1;
	if (South) inputLatitude *= -1;
	int zeroAzimuth = NORTH;
	
}
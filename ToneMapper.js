
function clamp(x, low, high)
{
    return Math.min(Math.max(x, low), high);
}

function safe_exp(x)
{
    return Math.exp(clamp(x, -700.0, 700.0));
}

function smoothstep(x, edge0, edge1)
{
    var t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return (3.0 - 2.0 * t) * t * t;
}

function luminance(r, g, b)
{
    return r * 0.263 + g * 0.655 + b * 0.082;
}

function reinhardToneMap(x, burnValue)
{
    x = Math.max(x, 0.0);
    var highlights = burnValue * burnValue;
    return x * (1.0 + x * highlights) / (1.0 + x);
}

function exponentialToneMap(x)
{
    return (1.0 - safe_exp(-1.6 * x));
}

function gammaCorrect(x, gammaValue)
{
    return Math.pow(clamp(x, 0.0, 1.0), 1.0 / gammaValue);
}

function Fnts(x, k)
{
    return (x - x * k) / (k - Math.abs(x) * 2.0 * k + 1.0);
}
function Fc(x)
{
    return x * 0.5 + 0.5;
}

function Fd(x)
{
    return 2.0 * x - 1.0;
}

function Fnts3(x, k1, k2, k3)
{
    return Fd(Fnts(Fc(Fnts(Fd(Fnts(Fc(x), k1)), k2)), k3));
}

function adjustContrast(x, contrastValue)
{
    if (contrastValue == 0.0)
        return x;

    var k = clamp(-contrastValue, -0.999, 0.999);
    var xp = Fd(clamp(x, 0.0, 1.0));
    var yp = Fnts3(xp, -0.55, k, 0.34);
    return Fc(yp);
}

function convert8Bit(x)
{
    return clamp(x * 255.0, 0.0, 255.0);
}

function convertLDR(x, multiplierValue, burnValue, gammaValue, contrastValue, toneOpType, brightValue, intensity)
{
    if (toneOpType == "reinhard")
    {
        x *= multiplierValue;
        x = reinhardToneMap(x, burnValue);
        // console.log(x);
    }
    else if(toneOpType == "Uncharted2"){
        x = F(1.6 * multiplierValue * x)/ F(burnValue);
        // console.log(f);

    }
    else if(toneOpType == "aces")
    {
        var A = 2.51;
        var B = 0.03;
        var C = 2.43;
        var D = 0.59;
        var E = 0.14;
        // if(x % 5  == 0){console.log(x)};
        x *= multiplierValue;

        // if(x % 5  == 0){console.log(color)};
        x = (x * (A * x + B)) / (x * (C * x + D) + E);
        // return color;
    }
    else
    {
        var darkValue = multiplierValue;
        var darkPart = (-0.6 * intensity + 0.8) * x;
        var brightPart = (0.6 * intensity + 0.2) * x;
        x = darkPart * darkValue + brightPart * brightValue;
        x = exponentialToneMap(x);
        // console.log(x);
    }
    x = gammaCorrect(x, gammaValue);
    x = adjustContrast(x, contrastValue);
    return convert8Bit(x);
}


function F(x)
{
	var A = 0.22;
	var B = 0.30;
	var C = 0.10;
	var D = 0.20;
	var E = 0.01;
	var F = 0.30;
 
	return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
}

function Uncharted2ToneMapping(color, adapted_lum)
{
	var WHITE = 11.2;
	return F(1.6 * adapted_lum * color) / F(WHITE);
}



function convertAlpha(x)
{
    return convert8Bit(x);
}

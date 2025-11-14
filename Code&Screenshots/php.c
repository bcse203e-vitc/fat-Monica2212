<?php
function lineSum(string $filename, int $lineNumber): int {
    if (!file_exists($filename)) {
        return 0;
    }

    $handle = fopen($filename, "r");
    if (!$handle) {
        return 0;
    }

    $current = 0;
    $sum = 0;

    while (($line = fgets($handle)) !== false) {
        $current++;

        $trim = trim($line);

        // skip empty lines and comments
        if ($trim === "" || str_starts_with($trim, "#")) {
            continue;
        }

        if ($current === $lineNumber) {
            $tokens = preg_split('/\s+/', $trim);

            foreach ($tokens as $t) {
                if (preg_match('/^-?\d+$/', $t)) {
                    $sum += intval($t);
                }
            }

            fclose($handle);
            return $sum;
        }
    }

    fclose($handle);
    return 0; // file ended before reaching that line
}
?>


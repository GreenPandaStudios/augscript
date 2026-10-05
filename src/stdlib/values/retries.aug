// aug-spec: "retries.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Duration from durations

/** Caller-selected retry delays, stored as deeply immutable data.
 * Attempts are numbered from one; maxAttempts includes the initial attempt.
 * @param maxAttempts Total allowed attempts, from 1 to 64.
 * @param delays Exactly maxAttempts - 1 durations, each from 0 to 604800000 milliseconds.
 * Order, duplicates and zero delays are preserved. Construction performs no operation or wait.
 * @throws ConversionError Invalid attempt count, delay count or delay duration.
 */
record RetryPolicy(int maxAttempts, immutable List<Duration> delays):
    initialize:
        if maxAttempts < 1 or maxAttempts > 64:
            throw ConversionError()
        if delays.length() != maxAttempts - 1:
            throw ConversionError()
        for delay in delays:
            if delay.milliseconds < 0 or delay.milliseconds > 604800000:
                throw ConversionError()

/** Read the delay after a failed attempt, or null after the final allowed attempt.
 * This only reads policy data: it does not retry, sleep, classify an error or choose a recovery value.
 * @param failedAttempt One-based attempt number, from 1 to policy.maxAttempts.
 * @throws ConversionError The attempt number is outside the policy.
 */
retryDelay(RetryPolicy policy, int failedAttempt):
    if failedAttempt < 1 or failedAttempt > policy.maxAttempts:
        throw ConversionError()
    if failedAttempt == policy.maxAttempts:
        return null
    return policy.delays.at(index=failedAttempt - 1)

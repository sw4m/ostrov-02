<?php

namespace App\Console\Commands;

use App\Http\Controllers\OpenAIController;
use Illuminate\Console\Command;

class TestAI extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-a-i';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test AI Command';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        OpenAIController::index();
    }
}

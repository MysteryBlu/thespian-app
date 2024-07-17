import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SecondsToTime } from '../shared/pipes/seconds-to-time.pipe';
import { Folder, Subtitle } from '../core/models/video.model';
import { VideoService } from '../core/services/video.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SecondsToTime, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  currentSubtitles = '';
  subtitles: Subtitle[] = [];
  folders: Folder[] = [];
  videoSrc!: string;

  currentFontSize: number = 20;
  currentFontColor: string = 'white';
  fontSizes: number[] = [10, 12, 14, 16, 18, 20, 22, 24, 26];
  fontColors: string[] = ['white', 'yellow', 'red', 'green', 'blue'];


  private videoElement!: HTMLVideoElement;

  constructor(
    private service: VideoService
  ) {
    this.loadFolders();
  }

  ngOnInit(): void {
    this.videoElement = document.getElementById('video') as HTMLVideoElement;
    this.videoElement.addEventListener('timeupdate', this.updateSubtitles.bind(this));
  }

  loadFolders(): void {
    this.service.getFolders().subscribe(data => {
      this.folders = data.folders;
      this.loadVideo(this.folders[0].name);
    })
  }

  loadVideo(videoName: string) {
    const index = this.folders.findIndex(f => f.name === videoName);
    this.videoSrc = `assets/${videoName}/${this.folders[index].video}`;
    this.loadSubtitles(videoName, this.folders[index].captions);
  }

  loadSubtitles(videoName: string, captionsName: string): void {
    this.service.getSubtitles(videoName, captionsName).subscribe(data => {
      this.subtitles = this.parseSRT(data);
    });
  }

  parseSRT(srt: string): Subtitle[] {
    const subtitles: Subtitle[] = [];
    const lines = srt.split('\r\n');
    let subtitle: Subtitle = { start: 0, end: 0, text: '' };

    for (const line of lines) {
      if (line.match(/^\d+$/)) {
        if (subtitle.text) {
          subtitles.push(subtitle);
          subtitle = { start: 0, end: 0, text: '' };
        }
      } else if (line.includes('-->')) {
        const times = line.split(' --> ');
        subtitle.start = this.timeToSeconds(times[0]);
        subtitle.end = this.timeToSeconds(times[1]);
      } else if (line.trim()) {
        subtitle.text += line;
      }
    }
    if (subtitle.text) {
      subtitles.push(subtitle);
    }
    
    this.currentSubtitles = '';

    return subtitles;
  }

  timeToSeconds(time: string): number {
    const parts = time.split(':');
    const seconds = parts[2].split(',')[0];
    const milliseconds = parts[2].split(',')[1];
    return (
      parseInt(parts[0], 10) * 3600 +
      parseInt(parts[1], 10) * 60 +
      parseInt(seconds, 10) +
      parseInt(milliseconds, 10) / 1000
    );
  }

  updateSubtitles(): void {
    const currentTime = this.videoElement.currentTime;

    const index = this.subtitles.findIndex(s => currentTime >= s.start && currentTime <= s.end);

    if (index >= 0) {
      this.currentSubtitles = this.subtitles[index].text;
    } else {
      this.currentSubtitles = '';
    }

    this.highlightActiveSubtitle(index);
  }

  highlightActiveSubtitle(index: number): void {
    const transcriptElements = document.getElementsByClassName('transcript-item');
    for (let i = 0; i < transcriptElements.length; i++) {
      transcriptElements[i].classList.remove('active');
    }
    if (index !== -1 && transcriptElements[index]) {
      transcriptElements[index].classList.add('active');
      transcriptElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  seekToSubtitle(subtitle: Subtitle): void {
    this.videoElement.currentTime = subtitle.start;
  }

  changeSubtitleFontSize(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const size = selectElement ? +selectElement.value : this.currentFontSize;
    this.currentFontSize = size;
    this.updateSubtitleStyle();
  }

  changeSubtitleFontColor(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const color = selectElement ? selectElement.value : this.currentFontColor;
    this.currentFontColor = color;
    this.updateSubtitleStyle();
  }

  updateSubtitleStyle(): void {
    const subtitlesElement = document.getElementById('subtitles') as HTMLDivElement;
    if (subtitlesElement) {
      subtitlesElement.style.fontSize = `${this.currentFontSize}px`;
      subtitlesElement.style.color = this.currentFontColor;
    }
  }
}
